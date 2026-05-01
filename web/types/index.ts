export interface PlayerStats {
  gp: number
  g: number
  a: number
  pts: number
  plus_minus: number
  pim: number
  ppg: number
  ppa: number
  ppp: number
  sog: number
  hits: number
  blk: number
  gw: number
  atoi: number
  l7_g: number
  l7_a: number
  l7_pts: number
  l7_gp: number
  l15_g: number
  l15_a: number
  l15_pts: number
  l15_gp: number
  l30_g: number
  l30_a: number
  l30_pts: number
  l30_gp: number
  proj_g: number
  proj_a: number
  proj_pts: number
  proj_gp: number
}

export interface Player {
  name: string
  position: string
  lineup_slot: string
  pro_team: string
  injured: boolean
  injury_status: string
  stats: PlayerStats
  games_this_week?: number
  hot_score?: number
}

export interface TeamInfo {
  team_name: string
  manager: string
  record: string
  wins: number
  losses: number
  week: number
  league_name: string
}

export interface MatchupInfo {
  my_score: number
  opp_score: number
  opponent_name: string
  winning: boolean
  lead: number
}

export interface FreeAgent extends Player {
  fa_score: number
  rise_delta?: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ManagerEntry {
  index: number
  team_name: string
  manager: string
  wins: number
  losses: number
}
