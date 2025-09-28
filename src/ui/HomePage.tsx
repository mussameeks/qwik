import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { fetchCountriesWithMatches } from '../api/client'
import type { Match } from '../types'
import CountryAccordion from './components/CountryAccordion'

type Ctx = { selectedDate: dayjs.Dayjs }

export default function HomePage(){
  const { selectedDate } = useOutletContext<Ctx>()
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchCountriesWithMatches>>>([])
  const [open, setOpen] = useState<string | null>(null)
  const nav = useNavigate()

  useEffect(()=>{
    fetchCountriesWithMatches(selectedDate.toISOString()).then(setData)
  },[selectedDate])

  return (
    <div className="container">
      <h2 style={{margin:'6px 0 12px'}}>Fixtures for {selectedDate.format('ddd, MMM D')}</h2>
      {data.map(({country, matches}) => (
        <CountryAccordion
          key={country.id}
          country={country}
          matches={matches}
          isOpen={open===country.id}
          onToggle={() => setOpen(open===country.id? null : country.id)}
          onMatchClick={(m: Match)=> nav(`/match/${m.id}`)}
        />
      ))}
      {data.length===0 && <p className="small">No fixtures for this date.</p>}
    </div>
  )
}
