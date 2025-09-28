// src/api/presence.ts
import { sb } from './supabase'

export type PresenceState = {
  users: { id: string; username: string }[]
  typing: { id: string; username: string }[]
}

export type PresenceHandle = {
  setTyping: (isTyping: boolean) => void
  unsubscribe: () => void
}

export function joinPresence(roomId: string, me: { id: string; username: string }, onChange: (s: PresenceState)=>void): Promise<PresenceHandle> {
  return new Promise(async (resolve) => {
    const channel = sb.channel(`presence:${roomId}`, { config: { presence: { key: me.id } } })

    function emit() {
      const state = channel.presenceState() as Record<string, any[]>
      const all = Object.values(state).flat()
      const users = dedupeBy(all.map(x => ({ id: x.id, username: x.username })), 'id')
      const typing = dedupeBy(all.filter(x => x.typing), 'id').map(x => ({ id: x.id, username: x.username }))
      onChange({ users, typing })
    }

    channel.on('presence', { event: 'sync' }, emit)
    channel.on('presence', { event: 'join' }, emit)
    channel.on('presence', { event: 'leave' }, emit)

    await channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return
      await channel.track({ id: me.id, username: me.username, typing: false })
      resolve({
        setTyping: (isTyping: boolean) => {
          channel.track({ id: me.id, username: me.username, typing: !!isTyping })
        },
        unsubscribe: () => { sb.removeChannel(channel) }
      })
    })
  })
}

function dedupeBy<T extends Record<string, any>>(arr: T[], key: keyof T): T[] {
  const map = new Map<string, T>()
  for (const it of arr) map.set(String(it[key]), it)
  return Array.from(map.values())
}
