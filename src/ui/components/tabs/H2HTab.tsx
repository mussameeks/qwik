import type { MatchDetails } from '../../../types'

export default function H2HTab({details}: {details: MatchDetails}){
  const rows = details.h2h?.recent ?? []
  return (
    <div className="stat">
      <div style={{fontWeight:600, marginBottom:8}}>Recent head-to-head</div>
      {rows.length===0 && <div className="small">No data.</div>}
      {rows.length>0 && (
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr className="small" style={{textAlign:'left'}}>
              <th style={{padding:'6px 4px'}}>Date</th>
              <th style={{padding:'6px 4px'}}>Match</th>
              <th style={{padding:'6px 4px'}}>Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=> (
              <tr key={i} style={{borderTop:'1px solid var(--line)'}}>
                <td style={{padding:'8px 4px'}}>{new Date(r.date).toLocaleDateString()}</td>
                <td style={{padding:'8px 4px'}}>{r.home} vs {r.away}</td>
                <td style={{padding:'8px 4px'}}>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
