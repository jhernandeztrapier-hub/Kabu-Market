// components/Navbar.js
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [q, setQ] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`)
      setQ('')
    }
  }

  return (
    <nav style={{
      background: '#fff', borderBottom: '1px solid #e2ddd6',
      height: 60, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <BarLogo />
        <span style={{ fontWeight: 700, fontSize: 17, color: '#1e4d2b', fontFamily: 'Inter, sans-serif' }}>
          Kabu Market
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <NavLink href="/" label="Pulse" router={router} />
        <NavLink href="/newsletters" label="Newsletters" router={router} />
        <NavLink href="/search" label="Search" router={router} />
        <Link href="/newsletters" style={{
          background: '#1e4d2b', color: '#fff', padding: '7px 16px',
          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          Daily Digest →
        </Link>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search ticker or topic…"
          style={{
            background: '#f7f5f0', border: '1px solid #e2ddd6',
            borderRadius: 8, padding: '7px 14px', fontSize: 13,
            width: 200, outline: 'none', fontFamily: 'Inter, sans-serif',
          }}
        />
      </form>
    </nav>
  )
}

function NavLink({ href, label, router }) {
  const active = router.pathname === href
  return (
    <Link href={href} style={{
      fontSize: 14, fontWeight: 500, textDecoration: 'none',
      color: active ? '#1e4d2b' : '#6b7280',
    }}>
      {label}
    </Link>
  )
}

function BarLogo() {
  const heights = [12, 18, 26, 20, 14]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2.5, height: 28 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 5, height: h, background: '#1e4d2b', borderRadius: '2px 2px 0 0',
        }} />
      ))}
    </div>
  )
}
