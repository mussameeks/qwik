// src/ui/components/tabs/ChatTab.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import type { ChatMessage } from '../../../api/chatClient'
import { chatSupabase as chat } from '../../../api/chatSupabase'
import AuthGate from '../../components/AuthGate'
import { useAuth } from '../../../auth/AuthProvider'
import { joinPresence, type PresenceState } from '../../../api/presence'
import { fetchReactions, subscribeReactions, toggleReaction, type ReactionCounts, type MyReactions } from '../../../api/reactions'
import { postBotMessage } from '../../../api/bot'
import { fetchMatchDetails } from '../../../api/client'

const EMOJIS = ['❤️','😂','🔥'] as const

type Props = { fixtureId: string }

export default function ChatTab({ fixtureId }: Props){
  return (
    <AuthGate>
      <ChatInner fixtureId={fixtureId} />
    </AuthGate>
  )
}

function ChatInner({ fixtureId }: Props){
  const { user } = useAuth()
  const roomId = useMemo(()=> `chat:fixture:${fixtureId}`, [fixtureId])

  const [msgs, setMsgs] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)

  // presence
  const [presence, setPresence] = useState<PresenceState>({ users: [], typing: [] })
  const presenceHandle = useRef<{ setTyping: (b:boolean)=>void; unsubscribe: ()=>void }|null>(null)
  const typingTimer = useRef<number|undefined>(undefined)

  // reactions
  const [counts, setCounts] = useState<ReactionCounts>({})
  const [mine, setMine] = useState<MyReactions>({})

  // de-dupe of realtime vs optimistic
  const seen = useRef<Set<string>>(new Set())

  const viewRef = useRef<HTMLDivElement>(null)

  // initial load + realtime + reactions
  useEffect(()=>{
    let unsubMessages: (()=>void) | null = null
    let unsubReactions: (()=>void) | null = null

    ;(async ()=>{
      const initial = await chat.list(roomId, 30)
      setMsgs(initial)
      initial.forEach(m => seen.current.add(m.id))
      scrollToBottom()

      unsubMessages = await chat.join(roomId, (m)=> {
        if (seen.current.has(m.id)) return
        seen.current.add(m.id)

        // replace optimistic if matches (same user+text)
        setMsgs(prev => {
          const idx = prev.findIndex(x => x.id.startsWith('tmp-') && x.userId===m.userId && x.text===m.text)
          if (idx >= 0) {
            const copy = [...prev]; copy[idx] = m; return copy
          }
          return [...prev, m]
        })
        if (isAtBottom()) scrollToBottomSmooth()
      })

      // reactions (load + live)
      const { counts: c0, mine: m0 } = await fetchReactions(roomId)
      setCounts(c0); setMine(m0)
      unsubReactions = subscribeReactions(
        roomId,
        (mid, emoji) => setCounts(prev => ({ ...prev, [mid]: { ...(prev[mid]||{}), [emoji]: (prev[mid]?.[emoji]||0) + 1 } })),
        (mid, emoji) => setCounts(prev => ({ ...prev, [mid]: { ...(prev[mid]||{}), [emoji]: Math.max(0, (prev[mid]?.[emoji]||0) - 1) } })),
      )
    })()

    return ()=> { unsubMessages?.(); unsubReactions?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  // presence join/leave + typing
  useEffect(()=>{
    if (!user) return
    const username = getUsername(user)
    let handle: any
    joinPresence(roomId, { id: user.id, username }, (s)=> setPresence(s))
      .then(h => { presenceHandle.current = h; handle = h })
    return ()=> { handle?.unsubscribe?.(); presenceHandle.current = null }
  }, [roomId, user])

  // ---- DEV SIM BOT (enable with: localStorage.setItem('matchBot','1')) ----
  useEffect(()=>{
    let timer: number | undefined
    let running = true
    const enabled = localStorage.getItem('matchBot') === '1'
    if (!enabled) return

    async function tick() {
      if (!running) return
      try {
        const details = await fetchMatchDetails(fixtureId)
        const isLive = details?.match?.status === 'LIVE'
        if (isLive && Math.random() < 0.3) {
          const min = Math.max(1, Math.min(95, Math.floor((Date.now() - new Date(details.match.kickoff).getTime())/60000)))
          const home = details.match.home.name
          const away = details.match.away.name
          const which = Math.random() < 0.5 ? home : away
          const msg = Math.random() < 0.7 ? `⚽ Goal! ${min}’ – ${which}` : `🟨 ${which} booked at ${min}’`
          await postBotMessage(roomId, msg)
        }
      } catch { /* ignore */ }
      timer = window.setTimeout(tick, 15000 + Math.floor(Math.random()*15000)) // 15–30s
    }
    tick()
    return ()=> { running = false; if (timer) window.clearTimeout(timer) }
  }, [roomId, fixtureId])

  function isAtBottom(){
    const el = viewRef.current; if (!el) return true
    return el.scrollTop + el.clientHeight > el.scrollHeight - 40
  }
  function scrollToBottom(){ const el=viewRef.current; if(el){ el.scrollTop = el.scrollHeight } }
  function scrollToBottomSmooth(){ const el=viewRef.current; if(el){ el.scrollTo({top: el.scrollHeight, behavior:'smooth'}) } }

  function onInput(e: React.ChangeEvent<HTMLInputElement>){
    setText(e.target.value)
    if (presenceHandle.current) {
      presenceHandle.current.setTyping(true)
      if (typingTimer.current) window.clearTimeout(typingTimer.current)
      typingTimer.current = window.setTimeout(()=> presenceHandle.current?.setTyping(false), 1200)
    }
  }

  async function send(){
    if (!user) return
    const trimmed = text.trim()
    if (!trimmed) return
    if (trimmed.length > 500) return alert('Message too long (max 500).')

    const username = getUsername(user)
    const tmpId = `tmp-${crypto.randomUUID()}`

    // optimistic bubble
    const optimistic: ChatMessage = {
      id: tmpId,
      roomId,
      userId: user.id,
      username,
      text: trimmed,
      createdAt: new Date().toISOString()
    }
    setMsgs(prev => [...prev, optimistic])
    setText('')
    scrollToBottomSmooth()

    try {
      const saved = await chat.send(roomId, { roomId, userId: user.id, username, text: trimmed })
      seen.current.add(saved.id)
      setMsgs(prev => {
        const idx = prev.findIndex(x => x.id === tmpId)
        if (idx >= 0) { const copy = [...prev]; copy[idx] = saved; return copy }
        if (prev.some(x => x.id === saved.id)) return prev
        return [...prev, saved]
      })
    } catch (e: any) {
      console.error('chat insert error', e)
      alert(e?.message ?? 'Failed to send. Please retry.')
      setMsgs(prev => prev.filter(x => x.id !== tmpId))
    }
  }

  async function loadMore(){
    if (loadingMore || msgs.length === 0) return
    setLoadingMore(true)
    try {
      const older = await chat.list(roomId, 30, msgs[0].id)
      const filtered = older.filter(m => !seen.current.has(m.id))
      filtered.forEach(m => seen.current.add(m.id))
      setMsgs(prev => [...filtered, ...prev])
    } finally { setLoadingMore(false) }
  }

  async function onReact(messageId: string, emoji: string){
    if (!user) return
    await toggleReaction(roomId, messageId, emoji, user.id)
    setMine(prev => {
      const cur = new Set(prev[messageId] ?? [])
      if (cur.has(emoji)) cur.delete(emoji); else cur.add(emoji)
      return { ...prev, [messageId]: cur }
    })
  }

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div className="presence">
          <b>Live Chat</b>
          <span className="dot" />
          <span className="small">{presence.users.length} online</span>
          {presence.typing.length > 0 && (
            <span className="small typing"> · {presence.typing.slice(0,2).map(u=>u.username).join(', ')}{presence.typing.length>2?'…':''} typing…</span>
          )}
        </div>
        <button className="chip" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading…' : 'Load older'}
        </button>
      </div>

      <div className="chat-view" ref={viewRef} role="log" aria-live="polite" aria-relevant="additions">
        {msgs.map(m=>(
          <div key={m.id} className={`chat-msg ${user && m.userId===user.id ? 'me':''} ${m.userId==='bot' ? 'bot':''}`}>
            <div className="meta">
              <b>{m.username}</b>
              <span className="time">{dayjs(m.createdAt).format('HH:mm')}</span>
            </div>
            <div className="bubble">
              {m.text}
              <div className="reactions">
                {EMOJIS.map(emoji=>{
                  const c = counts[m.id]?.[emoji] || 0
                  const mineSet = mine[m.id] || new Set<string>()
                  const active = mineSet.has(emoji)
                  return (
                    <button
                      key={emoji}
                      className={`react ${active?'active':''}`}
                      onClick={()=> onReact(m.id, emoji)}
                      title={emoji}
                      disabled={m.id.startsWith('tmp-')} // skip optimistic
                    >
                      <span>{emoji}</span>{c>0 && <em>{c}</em>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={onInput}
          onKeyDown={e=> { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Say something about the match…"
          maxLength={500}
        />
        <button onClick={send} disabled={!text.trim()}>Send</button>
      </div>
    </div>
  )
}

function getUsername(user: any): string {
  const u = user?.user_metadata
  if (u?.username && String(u.username).trim()) return String(u.username).trim()
  if (u?.full_name && String(u.full_name).trim()) return String(u.full_name).trim()
  return `User-${user.id.slice(0,6)}`
}
