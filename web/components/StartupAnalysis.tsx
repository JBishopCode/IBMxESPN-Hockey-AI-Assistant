'use client'

import { FaHockeyPuck } from 'react-icons/fa'

interface Props {
  analysis: string
  loading?: boolean
}

export default function StartupAnalysis({ analysis, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 mb-6">
          <FaHockeyPuck className="text-[var(--ice)] animate-pulse-ice" />
          <span className="font-mono text-sm text-[var(--text-secondary)]">
            AI is analyzing your roster...
          </span>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-4 w-full" style={{ width: `${85 + Math.random() * 15}%` }} />
        ))}
      </div>
    )
  }

  if (!analysis) return null

  // Parse the analysis into sections
  const sections = analysis.split(/\n(?=###?\s|\d+\.\s[A-Z])/g).filter(Boolean)

  return (
    <div className="space-y-6">
      {sections.map((section, i) => {
        const lines = section.trim().split('\n')
        const title = lines[0].replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim()
        const body = lines.slice(1).join('\n').trim()

        return (
          <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            {title && (
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-[var(--rink-border)]" />
                <p className="font-display text-xs font-bold tracking-[0.2em] text-[var(--ice)] uppercase whitespace-nowrap">
                  {title}
                </p>
                <div className="h-px flex-1 bg-[var(--rink-border)]" />
              </div>
            )}
            {body && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {body}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
