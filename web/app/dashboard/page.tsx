'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaHockeyPuck } from 'react-icons/fa'
import { MdComputer } from 'react-icons/md'
import { IoArrowBack } from 'react-icons/io5'
import { MdRefresh } from 'react-icons/md'
import RosterTable from '@/components/RosterTable'
import ChatInterface from '@/components/ChatInterface'
import MatchupCard from '@/components/MatchupCard'
import FreeAgentList from '@/components/FreeAgentList'
import StartupAnalysis from '@/components/StartupAnalysis'
import { fetchRoster, fetchAnalysis, fetchFreeAgents, fetchMatchup } from '@/lib/api'
import type { Player, TeamInfo, MatchupInfo, FreeAgent } from '@/types'

type Tab = 'analysis' | 'roster' | 'freeagents' | 'chat'

export default function Dashboard() {
  const router = useRouter()
  const [manager, setManager] = useState('')
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [analysis, setAnalysis] = useState('')
  const [freeAgents, setFreeAgents] = useState<FreeAgent[]>([])
  const [matchup, setMatchup] = useState<MatchupInfo | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('analysis')
  const [loadingRoster, setLoadingRoster] = useState(true)
  const [loadingAnalysis, setLoadingAnalysis] = useState(true)
  const [loadingFA, setLoadingFA] = useState(true)
  const [loadingMatchup, setLoadingMatchup] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const m = sessionStorage.getItem('manager')
    if (!m) {
      router.push('/')
      return
    }
    setManager(m)
    loadAll(m)
  }, [])

  const loadAll = async (m: string) => {
    setLoadingRoster(true)
    setLoadingAnalysis(true)
    setLoadingFA(true)
    setLoadingMatchup(true)
    setError('')

    // Load roster first (fast)
    try {
      const rosterData = await fetchRoster(m)
      setPlayers(rosterData.players || [])
      setTeamInfo(rosterData.team_info || null)
      setLoadingRoster(false)
    } catch (e) {
      setError('Failed to load roster. Is the Python API running?')
      setLoadingRoster(false)
    }

    // Load matchup
    try {
      const matchupData = await fetchMatchup(m)
      setMatchup(matchupData.matchup || null)
      setLoadingMatchup(false)
    } catch {
      setLoadingMatchup(false)
    }

    // Load free agents
    try {
      const faData = await fetchFreeAgents(m)
      setFreeAgents(faData.free_agents || [])
      setLoadingFA(false)
    } catch {
      setLoadingFA(false)
    }

    // Load AI analysis last (slowest)
    try {
      const analysisData = await fetchAnalysis(m)
      setAnalysis(analysisData.analysis || '')
      setLoadingAnalysis(false)
    } catch {
      setLoadingAnalysis(false)
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'analysis', label: 'AI Analysis' },
    { key: 'roster', label: 'Roster' },
    { key: 'freeagents', label: 'Free Agents' },
    { key: 'chat', label: 'Chat' },
  ]

  const record = teamInfo ? `${teamInfo.wins}–${teamInfo.losses}` : '—'
  const week = teamInfo?.week ?? '—'

  return (
    <div className="min-h-screen flex flex-col relative z-10">

      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--rink-border)] bg-[var(--rink)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-[var(--ice)] transition-colors"
            >
              <IoArrowBack className="text-sm" />
              <span className="font-mono text-xs">Back</span>
            </button>
            <div className="h-4 w-px bg-[var(--rink-border)]" />
            <div className="flex items-center gap-2">
              <FaHockeyPuck className="text-[var(--ice)] text-base" />
              <span className="font-display text-lg font-bold tracking-widest text-[var(--ice)] uppercase">
                Ice Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {teamInfo && (
              <div className="text-right hidden sm:block">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
                  {teamInfo.team_name}
                </p>
                <p className="font-mono text-xs text-[var(--text-dim)]">
                  {manager} · {record} · Week {week}
                </p>
              </div>
            )}
            <button
              onClick={() => loadAll(manager)}
              className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-[var(--ice)] transition-colors"
            >
              <MdRefresh className="text-base" />
              <span className="font-mono text-xs">Refresh</span>
            </button>
            <div className="flex items-center gap-1.5 text-[var(--text-dim)]">
              <MdComputer className="text-base" />
              <span className="font-mono text-xs hidden sm:inline">watsonx</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`font-display text-sm font-bold uppercase tracking-widest py-3 transition-all ${
                activeTab === key ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-[rgba(224,48,48,0.1)] border-b border-[var(--red)] px-6 py-3">
          <p className="font-mono text-xs text-[var(--red)] text-center">{error}</p>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">

        {/* Stats bar */}
        {teamInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Record', value: record },
              { label: 'League', value: teamInfo.league_name },
              { label: 'Week', value: `${week}` },
              { label: 'Roster', value: `${players.length} players` },
            ].map(({ label, value }) => (
              <div key={label} className="card px-4 py-3">
                <p className="font-mono text-xs text-[var(--text-dim)] uppercase tracking-wider mb-1">{label}</p>
                <p className="font-display text-lg font-bold text-[var(--ice-bright)]">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase">
                    AI Roster Analysis
                  </p>
                  <div className="flex items-center gap-1.5">
                    <MdComputer className="text-xs text-[var(--text-dim)]" />
                    <span className="font-mono text-xs text-[var(--text-dim)]">watsonx</span>
                  </div>
                </div>
                <StartupAnalysis analysis={analysis} loading={loadingAnalysis} />
              </div>
            </div>

            <div className="space-y-4">
              <MatchupCard matchup={matchup} week={Number(week)} loading={loadingMatchup} />

              {/* Quick injury report */}
              <div className="card p-4">
                <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase mb-3">
                  Injury Report
                </p>
                {loadingRoster ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-8 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players.filter(p => p.injured).length === 0 ? (
                      <p className="font-mono text-xs text-green-400">All players healthy</p>
                    ) : (
                      players.filter(p => p.injured).map(p => (
                        <div key={p.name} className="flex items-center justify-between">
                          <p className="text-sm text-[var(--text-primary)]">{p.name}</p>
                          <span className="px-2 py-0.5 text-xs badge-injured rounded-sm font-mono">
                            {p.injury_status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Hot players quick view */}
              <div className="card p-4">
                <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase mb-3">
                  Hot This Week
                </p>
                {loadingRoster ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-8 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players
                      .filter(p => !p.injured && p.stats.l7_pts >= 3)
                      .sort((a, b) => b.stats.l7_pts - a.stats.l7_pts)
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.name} className="flex items-center justify-between">
                          <p className="text-sm text-[var(--text-primary)]">{p.name}</p>
                          <span className="font-mono text-xs text-green-400 font-bold">
                            {p.stats.l7_pts} pts L7
                          </span>
                        </div>
                      ))}
                    {players.filter(p => !p.injured && p.stats.l7_pts >= 3).length === 0 && (
                      <p className="font-mono text-xs text-[var(--text-dim)]">No players with 3+ pts L7</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="card p-6">
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase mb-6">
              Full Roster
            </p>
            {loadingRoster ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : (
              <RosterTable players={players} />
            )}
          </div>
        )}

        {activeTab === 'freeagents' && (
          <div className="card p-6">
            <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase mb-6">
              Available Free Agents
            </p>
            <FreeAgentList agents={freeAgents} loading={loadingFA} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="card p-6" style={{ height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase">
                AI Chat
              </p>
              <div className="flex items-center gap-1.5">
                <MdComputer className="text-xs text-[var(--text-dim)]" />
                <span className="font-mono text-xs text-[var(--text-dim)]">llama-3-3-70b-instruct</span>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface manager={manager} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
