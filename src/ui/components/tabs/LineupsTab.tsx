import type { MatchDetails } from '../../../types'

export default function LineupsTab({details}: {details: MatchDetails}){
  const L = details.lineups
  return (
    <div className="grid">
      <div className="stat">
        <div style={{fontWeight:600, marginBottom:8}}>Home XI</div>
        <ol>{L?.homeXI?.map(p=> <li key={p}>{p}</li>)}</ol>
        {L?.homeSubs && <>
          <div className="small" style={{marginTop:8}}>Subs</div>
          <div className="small">{L.homeSubs.join(', ')}</div>
        </>}
      </div>
      <div className="stat">
        <div style={{fontWeight:600, marginBottom:8}}>Away XI</div>
        <ol>{L?.awayXI?.map(p=> <li key={p}>{p}</li>)}</ol>
        {L?.awaySubs && <>
          <div className="small" style={{marginTop:8}}>Subs</div>
          <div className="small">{L.awaySubs.join(', ')}</div>
        </>}
      </div>
      <div className="stat">
        <div className="small">Coaches</div>
        <div className="kv"><span>Home</span><b>{L?.coaches?.home ?? '-'}</b></div>
        <div className="kv"><span>Away</span><b>{L?.coaches?.away ?? '-'}</b></div>
      </div>
    </div>
  )
}
