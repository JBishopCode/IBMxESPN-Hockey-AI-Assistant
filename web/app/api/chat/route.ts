import { NextRequest, NextResponse } from 'next/server'

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const { manager, question, mode } = await req.json()
    const res = await fetch(`${PYTHON_API}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manager, question, mode }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
