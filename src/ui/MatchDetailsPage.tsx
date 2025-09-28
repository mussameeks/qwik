import { useParams } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { fetchMatchDetails } from '../api/client'
import type { MatchDetails } from '../types'
import Tabs from './components/Tabs'
import DetailsTab from './components/tabs/DetailsTab'
import LineupsTab from './components/tabs/LineupsTab'
import H2HTab from './components/tabs/H2HTab'
import ChatTab from './components/tabs/ChatTab'
import Breadcrumbs from './components/Breadcrumbs'

export default function MatchDetailsPage(){
  const { matchId } = useParams()
  const [md, setMd] = useState<MatchDetails | null>(null)
  const [tab, setTab] = useState<'details'|'lineups'|'h2h'|'chat'>('details')
  const [err, setErr] = useState<string | null>(null)

  useEffect(()=>{
    let cancelled = false
    async function run(){
      try{
        setErr(null)
        setMd(null)
        if (!matchId) { setErr('Missing match ID'); return }
        const details = await fetchMatchDetails(matchId)
        if (!cancelled) setMd(details)
      }catch(e:any){
        if (!cancelled) setErr(e?.message || 'Failed to load match details')
      }
    }
    run()
    return ()=> { cancelled = true }
  }, [matchId])

  // title yifashisha amazina ya home/away; fallback: "Match {id}" cyangwa "Match"
  const title = useMemo(()=>{
    const h = md?.match?.home?.name
    const a = md?.match?.away?.name
    if (h && a) return `${h} vs ${a}`
    return matchId ? `Match ${matchId}` : 'Match'
  }, [md, matchId])

  const crumbs = useMemo(()=> ([
    { label: 'Home', to: '/' },
    { label: title }
  ]), [title])

  if (err) return <div className="container" style={{padding:'16px 0'}}>{err}</div>
  if (!md) return <div className="container" style={{padding:'16px 0'}}>Loading…</div>

  const fixtureId = md?.match?.id ?? matchId ?? ''
  const hasFixtureId = Boolean(fixtureId)

  const items = [
    { id:'details', label:'Details' },
    { id:'h2h', label:'H2H' },
    { id:'lineups', label:'Lineups' },
    { id:'chat', label: hasFixtureId ? 'Chat' : 'Chat (unavailable)' },
  ] as const

  return (
    <div className="container" style={{padding:'16px 0'}}>
      <Breadcrumbs items={crumbs} />
      <h1 style={{margin:'8px 0 16px'}}>{title}</h1>

      <Tabs
        value={tab}
        onChange={(id)=> setTab(id as typeof tab)}
        items={items.map(x=> ({ id: x.id, label: x.label }))}
      />

      <div style={{marginTop:12}} />

      {tab==='h2h' ? (
        <H2HTab details={md} />
      ) : tab==='lineups' ? (
        <LineupsTab details={md} />
      ) : tab==='chat' ? (
        hasFixtureId ? <ChatTab fixtureId={String(fixtureId)} /> : (
          <div className="small" style={{opacity:.8}}>
            Chat is unavailable for this match (missing fixture id).
          </div>
        )
      ) : (
        <DetailsTab details={md} />
      )}
    </div>
  )
}
