// pages/index.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mentioned')
  const [sector, setSector] = useState('All')
  const [updating, setUpdating] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData(date) {
    setLoading(true)
    try {
      const url = date ? `/api/dashboard?date=${date}` : '/api/dashboard'
      const res = await fetch(url)
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function triggerUpdate() {
    setUpdating(true)
    try {
      await fetch('/api/trigger-update', { method: 'POST' })
      await fetchData()
    } finally {
      setUpdating(false)
    }
  }

  const SECTORS = ['All', 'Technology', 'Consumer Cyclical', 'Financials', 'Healthcare', 'Energy', 'Consumer Staples', 'Industrials', 'ETF']

  const baseList = tab === 'mentioned' ? data?.topMentioned : data?.biggestMovers
  const filtered = sector === 'All' ? baseList : baseList?.filter(t => t.sector === sector)

  const newsletter = data?.newsletters?.[0]

  return (
    <>
      <Head><title>Kabu Market — Daily Market Pulse</title></Head>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,15,0.5)', zIndex: 500, overflowY: 'auto', padding: '40px 20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2ddd6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 12px', borderRadius: 20 }}>{selectedArticle.source}</span>
              <button onClick={() => setSelectedArticle(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '28px 32px 36px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {(selectedArticle.tickers || []).map(t => (
                  <Link key={t} href={`/stock/${t}`} onClick={() => setSelectedArticle(null)}
                    style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '2px 8px', borderRadius: 20, textDecoration: 'none' }}>
                    {t}
                  </Link>
                ))}
              </div>
              <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 26, fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{selectedArticle.title}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0ece6' }}>
                {selectedArticle.source} · {selectedArticle.published ? formatDistanceToNow(new Date(selectedArticle.published), { addSuffix: true }) : 'Today'}
              </p>
              <div style={{ fontSize: 15, color: '#2d2d2d', lineHeight: 1.85 }}>
                {selectedArticle.body
                  ? selectedArticle.body.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 18 }}>{p}</p>)
                  : <p>{selectedArticle.snippet || 'No content available.'}</p>
                }
              </div>
              {selectedArticle.url && !selectedArticle.url.includes('/mock-') && (
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 24, fontSize: 13, fontWeight: 600, color: '#1e4d2b', textDecoration: 'none' }}>
                  Read full article → {selectedArticle.source}
                </a>
              )}
              <p style={{ marginTop: 24, fontSize: 11, color: '#aab5aa', fontStyle: 'italic', borderTop: '1px solid #e2ddd6', paddingTop: 14 }}>
                Kabu Market is for informational purposes only. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1e4d2b' }} className="pulse" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e4d2b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Market Pulse</span>
            </div>
            <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 36, fontWeight: 400 }}>
              Today's market <em style={{ color: '#1e4d2b' }}>pulse.</em>
            </h1>
            {data?.dateKey && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{data.dateKey}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {data?.availableDates?.length > 1 && (
              <select onChange={e => fetchData(e.target.value)} style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#1a1a1a' }}>
                {data.availableDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <button onClick={triggerUpdate} disabled={updating} style={{ background: '#1e4d2b', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {updating ? <><span className="spinner" style={{ width: 14, height: 14, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Updating…</> : '↻ Refresh Data'}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && data?.isEmpty && (
          <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 16, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📡</div>
            <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 24, marginBottom: 10 }}>No data yet</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Click refresh to load today's market data.</p>
            <button onClick={triggerUpdate} disabled={updating} style={{ background: '#1e4d2b', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {updating ? 'Loading…' : 'Load Market Data Now'}
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[...Array(8)].map((_, i) => <div key={i} style={{ height: 90, background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, opacity: 0.5 }} />)}
          </div>
        )}

        {!loading && data && !data.isEmpty && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
              <StatBox label="Tickers tracked" value={`${data.topMentioned.length}+`} />
              <StatBox label="Articles today" value={`${data.articles.length}`} />
              <StatBox label="Top mover" value={data.biggestMovers[0]?.ticker || '--'} sub={data.biggestMovers[0]?.pct_change != null ? `${data.biggestMovers[0].pct_change > 0 ? '+' : ''}${Number(data.biggestMovers[0].pct_change).toFixed(2)}%` : null} subUp={data.biggestMovers[0]?.pct_change > 0} />
              <StatBox label="Most mentioned" value={data.topMentioned[0]?.ticker || '--'} sub={data.topMentioned[0]?.mentions ? `${data.topMentioned[0].mentions} mentions` : null} />
            </div>

            {/* Newsletter banner */}
            {newsletter && (
              <Link href="/newsletters" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#1e4d2b', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>📰 Daily Newsletter</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{newsletter.title}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>Read digest →</span>
                </div>
              </Link>
            )}

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              {/* Left: Tickers */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e2ddd6', borderRadius: 10, padding: 4 }}>
                    {['mentioned', 'movers'].map(t => (
                      <button key={t} onClick={() => setTab(t)} style={{ fontSize: 13, fontWeight: 600, padding: '5px 16px', borderRadius: 7, border: 'none', cursor: 'pointer', background: tab === t ? '#1e4d2b' : 'none', color: tab === t ? '#fff' : '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                        {t === 'mentioned' ? 'Most Mentioned' : 'Biggest Movers'}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {SECTORS.map(s => (
                      <button key={s} onClick={() => setSector(s)} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: `1px solid ${sector === s ? '#d4e8d6' : '#e2ddd6'}`, background: sector === s ? '#d4e8d6' : '#fff', color: sector === s ? '#1e4d2b' : '#6b7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {(filtered || []).map(t => <TickerCard key={t.ticker} t={t} />)}
                  {filtered?.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#6b7280' }}>No stocks in this sector today.</div>}
                </div>
              </div>

              {/* Right: News */}
              <div>
                <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2ddd6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 18 }}>Latest headlines</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{data.articles.length} articles today</div>
                    </div>
                    <Link href="/articles" style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 10px', borderRadius: 20, textDecoration: 'none' }}>See all →</Link>
                  </div>
                  {data.articles.slice(0, 15).map(a => (
                    <div key={a.id} onClick={() => setSelectedArticle(a)} style={{ padding: '11px 16px', borderBottom: '1px solid #f0ece6', cursor: 'pointer' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8faf7'}
                      onMouseOut={e => e.currentTarget.style.background = ''}
                    >
                      <div style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.5, marginBottom: 4 }}>{a.title}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280' }}>{a.source}</span>
                        {a.published && <span style={{ fontSize: 10, color: '#aab5aa' }}>· {formatDistanceToNow(new Date(a.published), { addSuffix: true })}</span>}
                        {(a.tickers || []).slice(0, 2).map(t => (
                          <span key={t} style={{ fontSize: 10, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '1px 6px', borderRadius: 8 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#aab5aa', marginTop: 48 }}>
          Kabu Market is for informational purposes only. Not financial advice. Mentions ≠ endorsement.
        </p>
      </div>
    </>
  )
}

function StatBox({ label, value, sub, subUp }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 26, color: '#1a1a1a' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subUp ? '#1e4d2b' : '#6b7280', marginTop: 2 }}>{subUp ? '↑ ' : ''}{sub}</div>}
    </div>
  )
}

function TickerCard({ t }) {
  const up = t.pct_change > 0, dn = t.pct_change < 0
  return (
    <Link href={`/stock/${t.ticker}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: '13px 14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseOver={e => e.currentTarget.style.borderColor = '#1e4d2b'}
        onMouseOut={e => e.currentTarget.style.borderColor = '#e2ddd6'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{t.ticker}</span>
              {t.mentions > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '1px 6px', borderRadius: 10 }}>{t.mentions}x</span>}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{t.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {t.price && <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>${Number(t.price).toFixed(2)}</div>}
            {t.pct_change != null && (
              <div style={{ fontSize: 11, fontWeight: 600, color: up ? '#1e4d2b' : dn ? '#c0392b' : '#6b7280' }}>
                {up ? '↑' : dn ? '↓' : ''} {Math.abs(Number(t.pct_change)).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f0ece6' }}>
          <span style={{ fontSize: 10, color: '#aab5aa' }}>{t.sector}</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: up ? '#1e4d2b' : dn ? '#c0392b' : '#aab5aa', display: 'inline-block' }} />
        </div>
      </div>
    </Link>
  )
}
