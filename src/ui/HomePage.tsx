import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { fetchCountriesWithMatches } from '../api/client'
import type { Match } from '../types'
import CountryAccordion from './components/CountryAccordion'

type Ctx = { selectedDate: dayjs.Dayjs }

export default function HomePage(){
  const { selectedDate } = useOutletContext<Ctx>()
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchCountriesWithMatches>>>([])
  const [open, setOpen] = useState<string | null>(null)
  const [liveOnly, setLiveOnly] = useState(false)
  const nav = useNavigate()

  useEffect(()=>{
    let cancelled = false
    ;(async ()=>{
      const res = await fetchCountriesWithMatches(selectedDate.toISOString())
      if (!cancelled) setData(res)
    })()
    return ()=>{ cancelled = true }
  }, [selectedDate])

  // Filter to live matches when liveOnly is ON
  const filtered = useMemo(()=>{
    if (!liveOnly) return data
    return data
      .map(({ country, matches }) => ({
        country,
        matches: matches.filter(m => m.status === 'LIVE')
      }))
      .filter(({ matches }) => matches.length > 0)
  }, [data, liveOnly])

  // Is there any live match for this date? (for attention cue)
  const hasLive = useMemo(()=>{
    return data.some(({ matches }) => matches.some(m => m.status === 'LIVE'))
  }, [data])

  return (
    <div className="container" style={{padding:'0 16px'}}>
      {/* Heading row with LIVE toggle to the right */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem' }}>
        <h2 style={{ margin: 0 }}>
          Fixtures for {selectedDate.format('ddd, MMM D')}
        </h2>

        <button
          className="chip"
          onClick={() => setLiveOnly(!liveOnly)}
          aria-pressed={liveOnly}
          title={hasLive ? 'Show only live matches' : 'No live matches right now'}
          style={{
            position:'relative',
            fontWeight:600,
            background: liveOnly ? 'var(--danger, #ef4444)' : 'var(--panel, #161923)',
            color: liveOnly ? '#111' : 'var(--text, #e9edf5)',
            border: hasLive ? '1px solid var(--danger, #ef4444)' : '1px solid var(--line, #242a38)'
          }}
        >
          {hasLive && !liveOnly && (
            <span
              aria-hidden="true"
              style={{
                position:'absolute',
                top:6, left:8, width:8, height:8, borderRadius:8,
                background:'var(--danger, #ef4444)',
                boxShadow:'0 0 0 0 rgba(239,68,68,.7)',
                animation:'qwkPulse 1.5s ease-out infinite'
              }}
            />
          )}
          LIVE
        </button>
      </div>

      {/* Countries & matches */}
      {filtered.map(({country, matches}) => (
        <CountryAccordion
          key={country.id}
          country={country}
          matches={matches}
          isOpen={open===country.id}
          onToggle={() => setOpen(open===country.id? null : country.id)}
          onMatchClick={(m: Match)=> nav(`/match/${m.id}`)}
        />
      ))}

      {filtered.length===0 && (
        <p className="small">No {liveOnly ? 'live matches' : 'fixtures'} for this date.</p>
      )}
    </div>
  )
}
