'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaHockeyPuck } from 'react-icons/fa'
import { MdComputer } from 'react-icons/md'
import { fetchManagers } from '@/lib/api'
import type { ManagerEntry } from '@/types'

export default function LandingPage() {
  const router = useRouter()
  const [managers, setManagers] = useState<ManagerEntry[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchManagers()
      .then(data => {
        setManagers(data.teams || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Could not connect to backend. Make sure the Python API is running.')
        setLoading(false)
      })
  }, [])

  const handleEnter = async () => {
    if (!selected) return
    setConnecting(true)
    sessionStorage.setItem('manager', selected)
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 border-b border-[var(--rink-border)] bg-[var(--rink)]/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <FaHockeyPuck className="text-[var(--ice)] text-xl" />
          <span className="font-display text-xl font-bold tracking-widest text-[var(--ice)] uppercase">
            Ice Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text-dim)]">
          <MdComputer className="text-lg" />
          <span className="font-mono text-xs tracking-widest">Powered by watsonx</span>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center mb-16 animate-fade-up">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--ice-dim)]" />
          <FaHockeyPuck className="text-[var(--ice)] text-4xl" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--ice-dim)]" />
        </div>

        <h1 className="font-display text-7xl md:text-9xl font-black uppercase tracking-tight text-glow text-[var(--ice-bright)] leading-none mb-2">
          Ice
        </h1>
        <h1 className="font-display text-7xl md:text-9xl font-black uppercase tracking-tight text-[var(--text-secondary)] leading-none mb-8">
          Intelligence
        </h1>

        <p className="font-mono text-sm tracking-widest text-[var(--text-dim)] uppercase mb-2">
          ESPN Fantasy Hockey · Agentic AI · IBM watsonx
        </p>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg mx-auto font-light">
          Real-time roster analysis, waiver recommendations, matchup breakdowns,
          and trade evaluation — all powered by AI.
        </p>
      </div>

      {/* Manager selector card */}
      <div
        className="card glow-ice w-full max-w-md p-8 animate-fade-up"
        style={{ animationDelay: '0.15s' }}
      >
        <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase mb-6">
          Select Your Team
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-[var(--red)] font-mono text-sm text-center py-4">
            {error}
          </div>
        ) : (
          <div className="space-y-2 mb-8">
            {managers.map((m) => (
              <button
                key={m.index}
                onClick={() => setSelected(m.manager)}
                className={`w-full text-left px-4 py-3 border transition-all duration-150 rounded-sm ${
                  selected === m.manager
                    ? 'bg-[rgba(168,216,240,0.12)] border-[var(--ice-dim)] text-[var(--ice-bright)]'
                    : 'bg-[var(--rink-light)] border-[var(--rink-border)] text-[var(--text-secondary)] hover:border-[var(--ice-dim)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-base tracking-wide uppercase">
                      {m.manager}
                    </p>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5">
                      {m.team_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      {m.wins}–{m.losses}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleEnter}
          disabled={!selected || connecting || loading}
          className="btn-ice w-full py-4 text-base rounded-sm"
        >
          {connecting ? (
            <span className="animate-pulse-ice">Loading team data...</span>
          ) : (
            'Enter Dashboard'
          )}
        </button>
      </div>

      {/* Footer */}
      <div
        className="mt-12 flex items-center gap-6 text-[var(--text-dim)] animate-fade-up"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="flex items-center gap-2">
          <MdComputer className="text-base" />
          <span className="font-mono text-xs">IBM SkillsBuild 2026</span>
        </div>
        <div className="h-3 w-px bg-[var(--rink-border)]" />
        <span className="font-mono text-xs">Larry's Hockey League</span>
        <div className="h-3 w-px bg-[var(--rink-border)]" />
        <span className="font-mono text-xs">Track #3 — Sports & Entertainment</span>
      </div>
    </main>
  )
}
