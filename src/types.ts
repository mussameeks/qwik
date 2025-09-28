export type Country = {
  id: string
  name: string
  iso2: string
}

export type Competition = {
  id: string
  name: string
  countryId: string
}

export type Team = {
  id: string
  name: string
}

export type Match = {
  id: string
  countryId: string
  competition: string
  home: Team
  away: Team
  kickoff: string // ISO
  status: 'NS' | 'LIVE' | 'FT'
}

export type MatchDetails = {
  match: Match
  venue?: string
  referee?: string
  score?: { home: number, away: number }
  stats?: {
    possessionHome?: number
    possessionAway?: number
    shotsHome?: number
    shotsAway?: number
    cardsHome?: number
    cardsAway?: number
  }
  lineups?: {
    homeXI: string[]
    awayXI: string[]
    homeSubs?: string[]
    awaySubs?: string[]
    coaches?: {home?: string, away?: string}
  }
  h2h?: {
    recent: { date: string, home: string, away: string, score: string }[]
  }
}
