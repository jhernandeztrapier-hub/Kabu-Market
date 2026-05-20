// pages/articles.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function Articles() {
  const [articles, setArticles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Head><title>Today's Articles — Kabu Market</title></Head>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,15,0.5)', zIndex: 500, overflowY: 'auto', padding: '40px 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2ddd6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 12px', borderRadius: 20 }}>{selected.source}</span>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '28px 32px 36px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {(selected.tickers || []).map(t => (
                  <Link key={t} href={`/stock/${t}`} onClick={() => setSelected(null)}
                    style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '2px 8px', borderRadius: 20, textDecoration: 'none' }}>{t}</Link>
                ))}
              </div>
              <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 26, fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{selected.title}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0ece6' }}>
                {selected.source} · {selected.published ? formatDistanceToNow(new Date(selected.published), { addSuffix: true }) : 'Today'}
              </p>
              <div style={{ fontSize: 15, color: '#2d2d2d', lineHeight: 1.85 }}>
                {selected.body
                  ? selected.body.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 18 }}>{p}</p>)
                  : <p>{selected.snippet || 'No content available.'}</p>
                }
              </div>
              {selected.url && !selected.url.includes('/mock-') && (
                <a href={selected.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 24, fontSize: 13, fontWeight: 600, color: '#1e4d2b', textDecoration: 'none' }}>
                  Read full article at {selected.source} →
                </a>
              )}
              <p style={{ marginTop: 24, fontSize: 11, color: '#aab5aa', fontStyle: 'italic', borderTop: '1px solid #e2ddd6', paddingTop: 14 }}>
                Not financial advice. For informational purposes only.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 36, fontWeight: 400 }}>
            Today's <em style={{ color: '#1e4d2b' }}>articles.</em>
          </h1>
          {!loading && <span style={{ fontSize: 13, color: '#6b7280' }}>{articles.length} articles</span>}
        </div>

        {loading && <div style={{ color: '#6b7280' }}>Loading…</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {articles.map(a => (
            <div key={a.id} onClick={() => setSelected(a)}
              style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#1e4d2b'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#e2ddd6'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 10px', borderRadius: 20 }}>{a.source}</span>
                {a.published && <span style={{ fontSize: 11, color: '#aab5aa' }}>{formatDistanceToNow(new Date(a.published), { addSuffix: true })}</span>}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.5, marginBottom: 10 }}>{a.title}</div>
              {a.snippet && <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{a.snippet.slice(0, 120)}…</div>}
              {(a.tickers || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                  {a.tickers.slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 10, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '2px 7px', borderRadius: 10 }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
