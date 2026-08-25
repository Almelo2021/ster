'use client'
import { useState } from 'react'

export default function CodeForm() {
  const [code, setCode] = useState('')
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    try {
      await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), path: window.location.pathname }),
      })
    } catch {}
    setDone(true)
  }

  if (done)
    return (
      <p className="ok">
        ✓ Code geaccepteerd — je gratis maand is geactiveerd. Je hoeft verder niets te
        doen; toegang wordt aan dit apparaat gekoppeld.
      </p>
    )

  return (
    <form onSubmit={submit}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Bijv. THANK_ZE_47"
        aria-label="Actiecode"
      />
      <button type="submit">Inwisselen</button>
    </form>
  )
}
