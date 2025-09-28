import type { MatchDetails } from '../../../types'

export default function DetailsTab({details}: {details: MatchDetails}){
  const s = details.stats
  const status = details.match?.status ?? 'NS'
  const scoreText = details.score ? `${details.score.home} - ${details.score.away}` : '-'

  // Minute indicator for LIVE: computed from kickoff
  let minuteLabel: string | null = null
  if (status === 'LIVE') {
    const kickoff = new Date(details.match.kickoff).getTime()
    const mins = Math.max(0, Math.floor((Date.now() - kickoff) / 60000))
    // clamp to something sensible for mock data
    minuteLabel = `${Math.min(mins, 95)}'`
  }

  // CSS class for score color
  const scoreClass =
    status === 'LIVE' ? 'score-live'
    : status === 'FT' ? 'score-final'
    : 'score-default'

  return (
    <div className="grid">
      <div className="stat">
        <div className="kv"><span>Competition</span><b>{details.match.competition}</b></div>
        <div className="kv"><span>Kickoff</span><b>{new Date(details.match.kickoff).toLocaleString()}</b></div>
        {details.venue && <div className="kv"><span>Stadium</span><b>{details.venue}</b></div>}
        {details.referee && <div className="kv"><span>Referee</span><b>{details.referee}</b></div>}

        {/* SCORE row — ibara rihinduka; iyo LIVE twerekana na minute ku ruhande rw'ibitego */}
        <div className="kv">
          <span>Score</span>
          <div className="score-wrap">
            <b className={`score-val ${scoreClass}`}>{scoreText}</b>
            {status === 'LIVE' && <span className="min-badge">{minuteLabel}</span>}
          </div>
        </div>
      </div>

      <div className="stat">
        <div style={{marginBottom:8,fontWeight:600}}>Match Stats</div>
        <div className="kv"><span>Ball possession</span><b>{s?.possessionHome ?? '-'}% / {s?.possessionAway ?? '-'}%</b></div>
        <div className="kv"><span>Shots</span><b>{s?.shotsHome ?? '-'} / {s?.shotsAway ?? '-'}</b></div>
        <div className="kv"><span>Cards</span><b>{s?.cardsHome ?? '-'} / {s?.cardsAway ?? '-'}</b></div>
      </div>
    </div>
  )
}
