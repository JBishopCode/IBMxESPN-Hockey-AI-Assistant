'use client'

import { useState } from 'react'
import type { FreeAgent } from '@/types'

interface Props {
  agents: FreeAgent[]
  loading?: boolean
}

const POSITIONS = ['All', 'Forward', 'Center', 'Left Wing', 'Right Wing', 'Defense', 'Goalie']

export default function FreeAgentList({ agents, loading }: Props) {
  const [posFilter, setPosFilter] = useState('All')
  const [view, setView] = useState<'top' | 'hot' | 'rising'>('top')

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </div>
    )
  }

  const filtered = agents.filter(fa => {
    if (posFilter === 'All') return true
    if (posFilter === 'Forward') return ['Center', 'Left Wing', 'Right Wing'].includes(fa.position)
    return fa.position === posFilter
  })

  const getList = () => {
    if (view === 'hot') {
      return [...filtered].sort((a, b) =>
        (b.stats.l7_pts * 3 + b.stats.l15_pts) - (a.stats.l7_pts * 3 + a.stats.l15_pts)
      ).slice(0, 15)
    }
    if (view === 'rising') {
      return filtered
        .filter(fa => fa.rise_delta !== undefined)
        .sort((a, b) => (b.rise_delta ?? 0) - (a.rise_delta ?? 0))
        .slice(0, 15)
    }
    return filtered.slice(0, 20)
  }

  const list = getList()

  return (
    <div>
      {/* View toggle */}
      <div className="flex gap-6 mb-4">
        {(['top', 'hot', 'rising'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`font-display text-sm font-bold uppercase tracking-widest pb-2 transition-all ${
              view === v ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {v === 'top' ? 'Top Available' : v === 'hot' ? 'Hot Streak' : 'On The Rise'}
          </button>
        ))}
      </div>

      {/* Position filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {POSITIONS.map(pos => (
          <button
            key={pos}
            onClick={() => setPosFilter(pos)}
            className={`px-3 py-1 text-xs font-mono rounded-sm border transition-all ${
              posFilter === pos
                ? 'border-[var(--ice-dim)] text-[var(--ice)] bg-[rgba(168,216,240,0.08)]'
                : 'border-[var(--rink-border)] text-[var(--text-dim)] hover:border-[var(--rink-border)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {list.length === 0 && (
          <p className="text-[var(--text-dim)] font-mono text-sm text-center py-8">
            No players match this filter
          </p>
        )}
        {list.map((fa, i) => {
          const isHot = fa.stats.l7_pts >= 4
          const isRising = (fa.rise_delta ?? 0) > 0

          return (
            <div
              key={fa.name}
              className="flex items-center justify-between p-3 bg-[var(--rink-light)] border border-[var(--rink-border)] hover:border-[var(--ice-dim)] transition-all rounded-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[var(--text-dim)] w-5">{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{fa.name}</p>
                    {isHot && (
                      <span className="px-1.5 py-0.5 text-xs badge-hot rounded-sm font-mono">HOT</span>
                    )}
                    {isRising && !isHot && (
                      <span className="px-1.5 py-0.5 text-xs badge-cold rounded-sm font-mono">RISING</span>
                    )}
                    {fa.injured && (
                      <span className="px-1.5 py-0.5 text-xs badge-injured rounded-sm font-mono">
                        {fa.injury_status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-dim)]">
                    {fa.position} · {fa.pro_team}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 text-right">
                <div>
                  <p className="stat-val font-bold">{fa.stats.pts}</p>
                  <p className="text-xs text-[var(--text-dim)] font-mono">PTS</p>
                </div>
                <div>
                  <p className={`font-mono text-sm font-semibold ${isHot ? 'text-green-400' : 'text-[var(--ice)]'}`}>
                    {fa.stats.l7_pts}
                  </p>
                  <p className="text-xs text-[var(--text-dim)] font-mono">L7</p>
                </div>
                <div>
                  <p className="stat-val">{fa.stats.l30_pts}</p>
                  <p className="text-xs text-[var(--text-dim)] font-mono">L30</p>
                </div>
                {isRising && fa.rise_delta && (
                  <div>
                    <p className="font-mono text-sm font-semibold text-green-400">
                      +{fa.rise_delta}
                    </p>
                    <p className="text-xs text-[var(--text-dim)] font-mono">RISE</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
