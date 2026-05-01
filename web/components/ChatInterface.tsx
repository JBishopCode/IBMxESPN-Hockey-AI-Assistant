'use client'

import { useState, useRef, useEffect } from 'react'
import { FaHockeyPuck } from 'react-icons/fa'
import { IoSend } from 'react-icons/io5'
import { sendChat } from '@/lib/api'
import type { ChatMessage } from '@/types'

interface Props {
  manager: string
}

const QUICK_COMMANDS = [
  { label: 'Free Agents', cmd: 'free agents' },
  { label: 'Matchup', cmd: 'matchup' },
  { label: 'Hot Wire', cmd: 'hot wire' },
  { label: 'Start/Sit', cmd: 'Who should I start this week?' },
  { label: 'Drop?', cmd: 'Who should I consider dropping?' },
]

export default function ChatInterface({ manager }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Ice Intelligence is ready. Ask me anything about your fantasy hockey team — lineup decisions, waiver pickups, trade analysis, matchup strategy. Type or use a quick command below.`,
      timestamp: new Date().toLocaleTimeString(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await sendChat(manager, text)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'No response received.',
        timestamp: new Date().toLocaleTimeString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to the AI backend. Make sure the Python API is running.',
        timestamp: new Date().toLocaleTimeString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick commands */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_COMMANDS.map(({ label, cmd }) => (
          <button
            key={label}
            onClick={() => send(cmd)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider border border-[var(--rink-border)] text-[var(--text-secondary)] hover:border-[var(--ice-dim)] hover:text-[var(--ice)] transition-all rounded-sm disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-slide-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-[var(--rink-light)] border border-[var(--rink-border)] flex items-center justify-center mt-1">
                <FaHockeyPuck className="text-[var(--ice)] text-xs" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} px-4 py-3`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-[var(--text-primary)]">
                {msg.content}
              </p>
              <p className="text-xs text-[var(--text-dim)] mt-1 font-mono">
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-slide-in">
            <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-[var(--rink-light)] border border-[var(--rink-border)] flex items-center justify-center">
              <FaHockeyPuck className="text-[var(--ice)] text-xs animate-pulse-ice" />
            </div>
            <div className="bubble-ai px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ice)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ice)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--ice)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--rink-border)]">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your team, trades, pickups..."
          disabled={loading}
          className="ice-input flex-1 px-4 py-3 text-sm rounded-sm"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="btn-ice px-4 py-3 rounded-sm flex items-center gap-2"
        >
          <IoSend className="text-base" />
        </button>
      </div>
    </div>
  )
}
