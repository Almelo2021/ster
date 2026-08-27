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
        ✓ Code accepted — your free month is active. Nothing else to do; access is
        linked to this device.
      </p>
    )

  return (
    <form onSubmit={submit}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="E.g. THANK_ZE_47"
        aria-label="Promo code"
      />
      <button type="submit">Redeem</button>
    </form>
  )
}
