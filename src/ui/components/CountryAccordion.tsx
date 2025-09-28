import type { Country, Match } from '../../types'
import { flagUrl } from '../../lib/flag'

type Props = {
  country: Country
  matches: Match[]
  isOpen: boolean
  onToggle: () => void
  onMatchClick: (m: Match) => void
}

function minuteOf(kickoffISO: string){
  const t = new Date(kickoffISO).getTime()
  const mins = Math.max(0, Math.floor((Date.now() - t) / 60000))
  return `${Math.min(mins, 95)}'`
}

export default function CountryAccordion({country, matches, isOpen, onToggle, onMatchClick}: Props){
  // LIVE first, others after (stable)
  const ordered = [...matches].sort((a,b)=>{
    const al = a.status === 'LIVE', bl = b.status === 'LIVE'
    if (al && !bl) return -1
    if (!al && bl) return 1
    return 0
  })

  return (
    <section className={`section ${isOpen ? 'is-open' : ''}`}>
      <header className="section-head" onClick={onToggle} role="button" aria-expanded={isOpen}>
        <div className="head-left">
          <img src={flagUrl(country.iso2)} alt="" width={20} height={14} />
          <b style={{marginLeft:8}}>{country.name}</b>
        </div>
        <div className="head-right">
          <span className="chip">display matches ({matches.length})</span>
          <span className="chev">▾</span>
        </div>
      </header>

      {isOpen && (
        <div className="section-body">
          {ordered.map(m => (
            <div key={m.id} className={`match-row ${m.status === 'LIVE' ? 'is-live' : ''}`} onClick={()=> onMatchClick(m)} role="button">
              <div className="match-left">
                <div className="teams">{m.home.name} vs {m.away.name}</div>
              </div>
              <div className="match-right">
                <span className={`status badge ${m.status.toLowerCase()}`}>
                  {m.status === 'LIVE' ? `LIVE ${minuteOf(m.kickoff)}` :
                   m.status === 'FT'   ? 'FT' : ''}
                </span>
                <span className="time">
                  {new Date(m.kickoff).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
