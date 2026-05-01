'use client'

import { useState } from 'react'
import type { Player } from '@/types'

interface Props {
  players: Player[]
}

type SortKey = 'name' | 'pts' | 'l7_pts' | 'l30_pts' | 'games_this_week'

export default function RosterTable({ players }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('pts')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState<'all' | 'healthy' | 'injured'>('all')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filtered = players.filter(p => {
    if (filter === 'healthy') return !p.injured
    if (filter === 'injured') return p.injured
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    let av = 0, bv = 0
    if (sortKey === 'name') {
      return sortDir === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortKey === 'pts') { av = a.stats.pts; bv = b.stats.pts }
    if (sortKey === 'l7_pts') { av = a.stats.l7_pts; bv = b.stats.l7_pts }
    if (sortKey === 'l30_pts') { av = a.stats.l30_pts; bv = b.stats.l30_pts }
    if (sortKey === 'games_this_week') { av = a.games_this_week ?? 0; bv = b.games_this_week ?? 0 }
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className={`font-mono text-xs tracking-wider transition-colors ${
        sortKey === k ? 'text-[var(--ice)]' : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)]'
      }`}
    >
      {label}{sortKey === k ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </button>
  )

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-6 mb-4">
        {(['all', 'healthy', 'injured'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-display text-sm font-bold uppercase tracking-widest pb-2 transition-all ${
              filter === f ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {f} ({f === 'all' ? players.length : f === 'healthy'
              ? players.filter(p => !p.injured).length
              : players.filter(p => p.injured).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--rink-border)]">
              <th className="text-left py-2 pr-4">
                <SortBtn k="name" label="PLAYER" />
              </th>
              <th className="text-left py-2 pr-4 text-[var(--text-dim)] font-mono text-xs">POS</th>
              <th className="text-left py-2 pr-4 text-[var(--text-dim)] font-mono text-xs">STATUS</th>
              <th className="text-right py-2 pr-4">
                <SortBtn k="pts" label="PTS" />
              </th>
              <th className="text-right py-2 pr-4 text-[var(--text-dim)] font-mono text-xs">G</th>
              <th className="text-right py-2 pr-4 text-[var(--text-dim)] font-mono text-xs">A</th>
              <th className="text-right py-2 pr-4 text-[var(--text-dim)] font-mono text-xs">PPG</th>
              <th className="text-right py-2 pr-4">
                <SortBtn k="l7_pts" label="L7" />
              </th>
              <th className="text-right py-2 pr-4">
                <SortBtn k="l30_pts" label="L30" />
              </th>
              <th className="text-right py-2">
                <SortBtn k="games_this_week" label="GMS" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const isHot = p.stats.l7_pts >= 4
              const isCold = p.stats.l7_pts === 0 && p.stats.l7_gp >= 2
              const games = p.games_this_week ?? 0

              return (
                <tr
                  key={p.name}
                  className="border-b border-[var(--rink-border)]/50 hover:bg-[var(--rink-light)] transition-colors"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {isHot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                      {isCold && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
                      {!isHot && !isCold && <span className="w-1.5 h-1.5 rounded-full bg-transparent flex-shrink-0" />}
                      <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {p.name}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] ml-3.5">{p.pro_team}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs text-[var(--text-secondary)]">
                      {p.position.replace('Right Wing', 'RW').replace('Left Wing', 'LW').replace('Center', 'C').replace('Defense', 'D').replace('Goalie', 'G')}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 text-xs font-mono rounded-sm ${
                      p.injured ? 'badge-injured' : 'badge-active'
                    }`}>
                      {p.injured ? p.injury_status : 'ACT'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right stat-val font-bold">{p.stats.pts}</td>
                  <td className="py-3 pr-4 text-right stat-val">{p.stats.g}</td>
                  <td className="py-3 pr-4 text-right stat-val">{p.stats.a}</td>
                  <td className="py-3 pr-4 text-right stat-val">{p.stats.ppg}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`stat-val font-semibold ${isHot ? 'text-green-400' : ''}`}>
                      {p.stats.l7_pts}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right stat-val">{p.stats.l30_pts}</td>
                  <td className="py-3 text-right">
                    <span className={`font-mono text-xs font-bold ${
                      games >= 3 ? 'text-green-400' : games === 2 ? 'text-[var(--ice)]' : 'text-[var(--text-dim)]'
                    }`}>
                      {games}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--rink-border)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Hot (4+ pts L7)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Cold (0 pts, 2+ GP L7)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
          <span className="font-mono text-green-400 font-bold">3</span>
          games this week = start
        </div>
      </div>
    </div>
  )
}
