// src/ui/FullscreenChatPage.tsx
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChatTab from './components/tabs/ChatTab'

export default function FullscreenChatPage(){
  const nav = useNavigate()
  const { matchId } = useParams()
  const startX = useRef<number | null>(null)

  // lock body scroll while open
  useEffect(()=>{
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return ()=> { document.body.style.overflow = prev }
  }, [])

  // swipe-from-left to go back (mobile)
  function onTouchStart(e: React.TouchEvent){
    startX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent){
    const sx = startX.current
    if (sx == null) return
    const dx = e.changedTouches[0].clientX - sx
    if (sx < 40 && dx > 60) nav(-1) // from left edge, swipe right
    startX.current = null
  }

  if (!matchId) return null

  return (
    <div className="chat-fullscreen" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="chat-full-header">
        <button className="back-btn" onClick={()=> nav(-1)} aria-label="Back">←</button>
        <div className="chat-title">Live Chat</div>
        <div style={{width:36}} />{/* spacer */}
      </header>

      <div className="chat-full-main">
        <ChatTab fixtureId={matchId} />
      </div>
    </div>
  )
}
