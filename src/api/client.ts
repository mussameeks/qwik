import dayjs from 'dayjs'
import type { Country, Match, MatchDetails } from '../types'

/**
 * Toggle to real API by setting USE_MOCK=false and providing VITE_API_BASE.
 */
const USE_MOCK = true
const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchCountriesWithMatches(dateISO: string): Promise<{country: Country, matches: Match[]}[]>{
  if (USE_MOCK) return mockCountries(dateISO)
  const d = dayjs(dateISO).format('YYYY-MM-DD')
  const res = await fetch(`${API_BASE}/fixtures?date=${d}`)
  const data = await res.json()
  // TODO: transform provider payload -> { country, matches[] }[]
  return data
}

export async function fetchMatchDetails(matchId: string): Promise<MatchDetails>{
  if (USE_MOCK) return mockDetails(matchId)
  const res = await fetch(`${API_BASE}/match/${matchId}`)
  return res.json()
}

/* -----------------------------------------------------------
   MOCK ENGINE (deterministic per date)
   - Countries set
   - Competitions & Teams per country
   - Seeded RNG from YYYYMMDD
----------------------------------------------------------- */

const COUNTRIES: Country[] = [
  { id: 'DE', name: 'Germany', iso2: 'de' },
  { id: 'EN', name: 'England', iso2: 'gb' },
  { id: 'ES', name: 'Spain',   iso2: 'es' },
  { id: 'FR', name: 'France',  iso2: 'fr' },
  { id: 'IT', name: 'Italy',   iso2: 'it' },
  { id: 'RW', name: 'Rwanda',  iso2: 'rw' },
]

type Bank = {
  competitions: string[]
  teams: string[]
  venues: string[]
  referees: string[]
}

const BANK: Record<string, Bank> = {
  EN: {
    competitions: ['Premier League', 'Championship', 'FA Cup'],
    teams: ['Arsenal','Chelsea','Liverpool','Man City','Man United','Tottenham','Newcastle','Aston Villa','Leeds','Norwich'],
    venues: ['Emirates Stadium','Etihad Stadium','Old Trafford','Anfield','Stamford Bridge','Tottenham Hotspur Stadium'],
    referees: ['Michael Oliver','Anthony Taylor','Paul Tierney','Stuart Attwell'],
  },
  ES: {
    competitions: ['LaLiga', 'Copa del Rey'],
    teams: ['Real Madrid','Barcelona','Atletico','Sevilla','Valencia','Villarreal','Real Sociedad','Betis'],
    venues: ['Santiago Bernabéu','Camp Nou','Metropolitano','Ramon Sanchez Pizjuan'],
    referees: ['Mateu Lahoz','Gil Manzano','Juan Martínez Munuera'],
  },
  IT: {
    competitions: ['Serie A', 'Coppa Italia'],
    teams: ['Inter','Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina'],
    venues: ['San Siro','Allianz Stadium','Olimpico','Diego Armando Maradona'],
    referees: ['Daniele Orsato','Davide Massa','Marco Guida'],
  },
  DE: {
    competitions: ['Bundesliga', 'DFB-Pokal'],
    teams: ['Bayern','Dortmund','Leipzig','Leverkusen','Union Berlin','Frankfurt','Freiburg','Stuttgart'],
    venues: ['Allianz Arena','Signal Iduna Park','Red Bull Arena','BayArena'],
    referees: ['Felix Brych','Deniz Aytekin','Daniel Siebert'],
  },
  FR: {
    competitions: ['Ligue 1', 'Coupe de France'],
    teams: ['PSG','Marseille','Lyon','Monaco','Lille','Rennes','Nice','Lens'],
    venues: ['Parc des Princes','Velodrome','Groupama Stadium','Stade Louis II'],
    referees: ['Clément Turpin','Benoît Bastien','Ruddy Buquet'],
  },
  RW: {
    competitions: ['Rwanda Premier League'],
    teams: ['APR','Rayon Sports','Police','Kiyovu','AS Kigali','Gorilla','Bugesera','Mukura'],
    venues: ['Kigali Pele Stadium','Amahoro Stadium','Huye Stadium'],
    referees: ['Samuel Uwikunda','Pacifique Ndabihawenimana','Hakiruwizeye'],
  },
}

// Seeded RNG (Mulberry32-like) from YYYYMMDD
function seedFromDate(dateISO: string){
  const d = dayjs(dateISO)
  const num = Number(d.format('YYYYMMDD'))
  let t = (num ^ 0x9e3779b9) >>> 0
  return function rand(){
    t += 0x6D2B79F5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: ()=>number, arr: T[]): T{
  return arr[Math.floor(rng()*arr.length)]
}

function uniquePairs(rng: ()=>number, teams: string[], n: number){
  const pairs: {home:string, away:string}[] = []
  const pool = [...teams]
  for (let i=0; i<n; i++){
    const h = pick(rng, pool)
    let a = pick(rng, pool)
    let tries = 0
    while (a === h && tries++ < 5) a = pick(rng, pool)
    pairs.push({home:h, away:a})
  }
  return pairs
}

function mockCountries(dateISO: string): {country: Country, matches: Match[]}[]{
  const rng = seedFromDate(dateISO)
  const date = dayjs(dateISO).startOf('day')

  // generate matches per country (0–5) based on seeded RNG
  const rows = COUNTRIES.map((c) => {
    const bank = BANK[c.id]
    const count = Math.floor(rng() * 6) // 0..5
    const pairs = uniquePairs(rng, bank.teams, count)

    const matches: Match[] = pairs.map((p, i) => {
      // kickoff window: 12:00–22:00 local-ish, stagger by index
      const hour = 12 + Math.floor(rng()*10) // 12..21
      const minute = [0,15,30,45][Math.floor(rng()*4)]
      const ko = date.hour(hour).minute(minute).second(0).millisecond(0)


      const comp = pick(rng, bank.competitions)
      // deterministic id so details can be rebuilt from it later
      const id = `${c.id}-${date.format('YYYYMMDD')}-${i+1}`

      const status: Match['status'] =
        rng() < 0.05 ? 'LIVE' : (rng() < 0.1 ? 'FT' : 'NS')

      return {
        id,
        countryId: c.id,
        competition: comp,
        home: { id: `${c.id}-H${i}`, name: p.home },
        away: { id: `${c.id}-A${i}`, name: p.away },
        kickoff: ko.toISOString(),
        status
      }
    })

    return { country: c, matches }
  })

  // Only keep countries that actually have matches that day
  return rows
    .filter(r => r.matches.length > 0)
    .sort((a,b)=> a.country.name.localeCompare(b.country.name))
}

/** Build details from matchId so it works for any generated fixture. */
function mockDetails(matchId: string): MatchDetails{
  // Expected: CC-YYYYMMDD-index
  const [cc, ymd] = matchId.split('-')
  const date = dayjs(ymd, 'YYYYMMDD').isValid() ? dayjs(ymd, 'YYYYMMDD') : dayjs()
  const rng = seedFromDate(date.toISOString())
  const country = COUNTRIES.find(c => c.id === cc) ?? COUNTRIES[0]
  const bank = BANK[country.id]
  // fabricate teams again (names are not needed since HomePage already shows them; but we’ll still build something reasonable)
  const home = pick(rng, bank.teams)
  let away = pick(rng, bank.teams); let tries=0
  while (away===home && tries++<5) away = pick(rng, bank.teams)

  // score & stats (stable per (id,date))
  const homeGoals = Math.floor(rng()*4)
  const awayGoals = Math.floor(rng()*4)
  const possHome = 40 + Math.floor(rng()*21) // 40–60
  const possAway = 100 - possHome
  const shotsHome = 5 + Math.floor(rng()*12)
  const shotsAway = 5 + Math.floor(rng()*12)
  const cardsHome = Math.floor(rng()*4)
  const cardsAway = Math.floor(rng()*4)

  const kickoff = date.hour(12+Math.floor(rng()*10)).minute([0,15,30,45][Math.floor(rng()*4)]).toISOString()
  const isToday = dayjs(kickoff).isSame(dayjs(), 'day')

  const details: MatchDetails = {
    match: {
      id: matchId,
      countryId: country.id,
      competition: pick(rng, bank.competitions),
      home: { id: `${country.id}-H`, name: home },
      away: { id: `${country.id}-A`, name: away },
      kickoff,
      status: (isToday && rng() < 0.7) ? 'LIVE' : (rng() < 0.5 ? 'FT' : 'NS')

    },
    venue: pick(rng, bank.venues),
    referee: pick(rng, bank.referees),
    score: { home: homeGoals, away: awayGoals },
    stats: {
      possessionHome: possHome,
      possessionAway: possAway,
      shotsHome,
      shotsAway,
      cardsHome,
      cardsAway
    },
    lineups: {
      homeXI: generateXI(rng, bank.teams, home),
      awayXI: generateXI(rng, bank.teams, away),
      homeSubs: generateSubs(rng, 7),
      awaySubs: generateSubs(rng, 7),
      coaches: { home: `${home} Coach`, away: `${away} Coach` }
    },
    h2h: {
      recent: Array.from({length: 5}).map((_,i)=> {
        const d = date.subtract(i+1, 'month').format('YYYY-MM-DD')
        const hs = Math.floor(rng()*4)
        const as = Math.floor(rng()*4)
        return { date: d, home, away, score: `${hs}-${as}` }
      })
    }
  }
  return details
}

function generateXI(_rng: ()=>number, _pool: string[], teamName: string){
  // placeholder player list like "TeamName #1"
  return Array.from({length:11}).map((_,i)=> `${teamName} #${i+1}`)
}
function generateSubs(_rng: ()=>number, n: number){
  return Array.from({length:n}).map((_,i)=> `Sub ${i+1}`)
}
