'use client'

import type { MatchupInfo } from '@/types'

interface Props {
  matchup: MatchupInfo | null
  week: number
  loading?: boolean
}

export default function MatchupCard({ matchup, week, loading }: Props) {
  if (loading) {
    return (
      <div className="card p-6">
        <div className="skeleton h-4 w-32 mb-6" />
        <div className="skeleton h-16 w-full mb-4" />
        <div className="skeleton h-8 w-full" />
      </div>
    )
  }

  if (!matchup) {
    return (
      <div className="card p-6 text-center text-[var(--text-dim)] font-mono text-sm">
        No matchup data available
      </div>
    )
  }

  const pct = matchup.my_score + matchup.opp_score > 0
    ? (matchup.my_score / (matchup.my_score + matchup.opp_score)) * 100
    : 50

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase">
          Week {week} Matchup
        </p>
        <span className={`px-3 py-1 text-xs font-mono font-bold rounded-sm ${
          matchup.winning ? 'badge-hot' : 'badge-injured'
        }`}>
          {matchup.winning ? 'WINNING' : 'LOSING'}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <p className="font-display text-4xl font-black text-[var(--ice-bright)]">
            {matchup.my_score}
          </p>
          <p className="font-mono text-xs text-[var(--text-dim)] mt-1">YOUR SCORE</p>
        </div>

        <div className="text-center">
          <p className="font-display text-xl font-bold text-[var(--text-dim)]">VS</p>
          <p className={`font-mono text-xs mt-1 ${
            matchup.winning ? 'text-green-400' : 'text-[var(--red)]'
          }`}>
            {matchup.winning ? '+' : '-'}{matchup.lead} pts
          </p>
        </div>

        <div className="text-center">
          <p className="font-display text-4xl font-black text-[var(--text-secondary)]">
            {matchup.opp_score}
          </p>
          <p className="font-mono text-xs text-[var(--text-dim)] mt-1">
            {matchup.opponent_name.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-[var(--rink-light)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            matchup.winning
              ? 'bg-gradient-to-r from-[var(--ice-dim)] to-[var(--ice)]'
              : 'bg-gradient-to-r from-[var(--red)] to-[rgba(224,48,48,0.6)]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-xs text-[var(--text-dim)]">YOU</span>
        <span className="font-mono text-xs text-[var(--text-dim)]">{matchup.opponent_name}</span>
      </div>
    </div>
  )
}
