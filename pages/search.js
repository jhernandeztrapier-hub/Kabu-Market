// pages/search.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { formatDistanceToNow } from 'date-fns'

export default function Search() {
  const router = useRouter()
  const { q } = router.query
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (q) { setQuery(q); doSearch(q) }
  }, [q])

  async function doSearch(sq) {
    if (!sq?.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(sq)}`)
      setResults(await res.json())
    } finally { setLoading(false) }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, undefined, { shallow: true })
      doSearch(query.trim())
    }
  }

  return (
    <>
      <Head><title>Search — Kabu Market</title></Head>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 36, fontWeight: 400, marginBottom: 20 }}>
          Search <em style={{ color: '#1e4d2b' }}>everything.</em>
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ticker, company, or keyword…" autoFocus
            style={{ flex: 1, background: '#fff', border: '1px solid #e2ddd6', borderRadius: 10, padding: '11px 16px', fontSize: 15, outline: 'none', fontFamily: 'Inter, sans-serif', color: '#1a1a1a' }} />
          <button type="submit" style={{ background: '#1e4d2b', color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Search</button>
        </form>

        {!results && !loading && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['NVDA', 'TSLA', 'earnings', 'Federal Reserve', 'AI chips', 'healthcare'].map(s => (
              <button key={s} onClick={() => { setQuery(s); doSearch(s) }}
                style={{ fontSize: 13, color: '#1e4d2b', background: '#d4e8d6', border: 'none', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && <div style={{ color: '#6b7280' }}>Searching…</div>}

        {results && !loading && (
          <>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              "{results.query}" — {results.tickers?.length || 0} tickers, {results.articles?.length || 0} articles
            </p>

            {results.tickers?.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 22, fontWeight: 400, marginBottom: 14 }}>Matching tickers</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {results.tickers.map(t => (
                    <Link key={t.ticker} href={`/stock/${t.ticker}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#1e4d2b'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e2ddd6'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{t.ticker}</span>
                          {t.pct_change != null && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: t.pct_change > 0 ? '#1e4d2b' : '#c0392b' }}>
                              {t.pct_change > 0 ? '+' : ''}{Number(t.pct_change).toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{t.name}</div>
                        {t.price && <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginTop: 6 }}>${Number(t.price).toFixed(2)}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.articles?.length > 0 && (
              <div>
                <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 22, fontWeight: 400, marginBottom: 14 }}>Related articles</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {results.articles.map(a => (
                    <div key={a.id} style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '2px 8px', borderRadius: 20 }}>{a.source}</span>
                        {a.published && <span style={{ fontSize: 11, color: '#aab5aa' }}>{formatDistanceToNow(new Date(a.published), { addSuffix: true })}</span>}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.5 }}>{a.title}</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {(a.tickers || []).map(t => (
                          <Link key={t} href={`/stock/${t}`} style={{ fontSize: 10, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '1px 6px', borderRadius: 8, textDecoration: 'none' }}>{t}</Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!results.tickers?.length && !results.articles?.length && (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p>No results for "{results.query}"</p>
                <p style={{ fontSize: 13, marginTop: 8, color: '#aab5aa' }}>Try a ticker symbol (AAPL), company name, or keyword</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
