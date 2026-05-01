// lib/api.ts
// Client-side API helpers

export async function fetchRoster(manager: string) {
  const res = await fetch('/api/roster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manager }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchAnalysis(manager: string) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manager }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchFreeAgents(manager: string) {
  const res = await fetch('/api/freeagents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manager }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchMatchup(manager: string) {
  const res = await fetch('/api/matchup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manager }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function sendChat(manager: string, question: string, mode?: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ manager, question, mode }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchManagers() {
  const res = await fetch('/api/managers')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
