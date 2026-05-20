// pages/stock/[symbol].js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatDistanceToNow } from 'date-fns'

export default function StockDetail() {
  const router = useRouter()
  const { symbol } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartTab, setChartTab] = useState('price')
  const [selectedArticle, setSelectedArticle] = useState(null)

  useEffect(() => {
    if (!symbol) return
    fetch(`/api/ticker/${symbol}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [symbol])

  if (loading) return <div style={{ padding: 48, color: '#6b7280' }}>Loading…</div>
  if (!data) return <div style={{ padding: 48, color: '#c0392b' }}>Not found</div>

  const { ticker, info, snapshot, history, articles } = data
  const up = snapshot?.pct_change > 0
  const dn = snapshot?.pct_change < 0

  const chartData = (history || []).map(h => ({
    date: h.date_key?.slice(5),
    price: h.price ? parseFloat(Number(h.price).toFixed(2)) : null,
    mentions: h.mentions || 0,
  }))

  const ttStyle = { backgroundColor: '#fff', border: '1px solid #e2ddd6', borderRadius: 8, fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#1a1a1a' }

  return (
    <>
      <Head><title>${ticker} — {info?.name} | Kabu Market</title></Head>

      {selectedArticle && (
        <div onClick={() => setSelectedArticle(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,15,0.5)', zIndex: 500, overflowY: 'auto', padding: '40px 20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, margin: '0 auto', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2ddd6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 12px', borderRadius: 20 }}>{selectedArticle.source}</span>
              <button onClick={() => setSelectedArticle(null)} style={{ background: 'none', border: 'none', fontSize: 24, color: '#6b7280', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '28px 32px 36px' }}>
              <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 24, fontWeight: 400, lineHeight: 1.3, marginBottom: 8 }}>{selectedArticle.title}</h2>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f0ece6' }}>
                {selectedArticle.source} · {selectedArticle.published ? formatDistanceToNow(new Date(selectedArticle.published), { addSuffix: true }) : 'Today'}
              </p>
              <div style={{ fontSize: 15, color: '#2d2d2d', lineHeight: 1.85 }}>
                {selectedArticle.body
                  ? selectedArticle.body.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 18 }}>{p}</p>)
                  : <p>{selectedArticle.snippet}</p>
                }
              </div>
              {selectedArticle.url && !selectedArticle.url.includes('/mock-') && (
                <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-block', marginTop: 20, fontSize: 13, fontWeight: 600, color: '#1e4d2b', textDecoration: 'none' }}>
                  Read full article →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
          <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Pulse</Link> / <span style={{ color: '#1a1a1a', fontWeight: 600 }}>{ticker}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 40, fontWeight: 400 }}>
                $<em style={{ color: '#1e4d2b' }}>{ticker}</em>
              </h1>
              {snapshot?.pct_change != null && (
                <span style={{ fontSize: 16, fontWeight: 600, color: up ? '#1e4d2b' : dn ? '#c0392b' : '#6b7280' }}>
                  {up ? '↑' : dn ? '↓' : ''} {Math.abs(Number(snapshot.pct_change)).toFixed(2)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, color: '#6b7280' }}>{info?.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {info?.sector && <span style={{ fontSize: 11, fontWeight: 700, color: '#1a4d7a', background: '#ddeef9', padding: '3px 10px', borderRadius: 20 }}>{info.sector}</span>}
              {snapshot?.mentions > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '3px 10px', borderRadius: 20 }}>{snapshot.mentions} mentions today</span>}
            </div>
          </div>

          {snapshot?.price && (
            <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: '18px 24px', textAlign: 'right', minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Current Price</div>
              <div style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 36, color: '#1a1a1a', marginBottom: 4 }}>${Number(snapshot.price).toFixed(2)}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: up ? '#1e4d2b' : dn ? '#c0392b' : '#6b7280' }}>
                {up ? '↑' : dn ? '↓' : ''} ${Math.abs(Number(snapshot.price_change || 0)).toFixed(2)} · {up ? '+' : ''}{Number(snapshot.pct_change || 0).toFixed(2)}%
              </div>
              {snapshot.volume && <div style={{ fontSize: 11, color: '#aab5aa', marginTop: 4 }}>Vol: {(snapshot.volume / 1e6).toFixed(1)}M</div>}
              <div style={{ fontSize: 11, color: '#aab5aa', marginTop: 2 }}>as of {snapshot.date_key}</div>
            </div>
          )}
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 20, fontWeight: 400 }}>Historical data</h2>
              <div style={{ display: 'flex', gap: 4, background: '#f7f5f0', border: '1px solid #e2ddd6', borderRadius: 8, padding: 4 }}>
                {['price', 'mentions'].map(t => (
                  <button key={t} onClick={() => setChartTab(t)} style={{ fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: chartTab === t ? '#1e4d2b' : 'none', color: chartTab === t ? '#fff' : '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'price' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={ttStyle} />
                    <Line type="monotone" dataKey="price" stroke="#1e4d2b" strokeWidth={2} dot={false} name="Price ($)" connectNulls />
                  </LineChart>
                ) : (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter' }} />
                    <Tooltip contentStyle={ttStyle} />
                    <Bar dataKey="mentions" fill="#d4e8d6" radius={[3, 3, 0, 0]} name="Mentions" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Articles */}
        <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 24, fontWeight: 400, marginBottom: 16 }}>
          Related news
        </h2>
        {articles.length === 0 && <p style={{ color: '#6b7280' }}>No articles yet for {ticker}.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {articles.map(a => (
            <div key={a.id} onClick={() => setSelectedArticle(a)}
              style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#1e4d2b'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#e2ddd6'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '2px 8px', borderRadius: 20 }}>{a.source}</span>
                {a.published && <span style={{ fontSize: 11, color: '#aab5aa' }}>{formatDistanceToNow(new Date(a.published), { addSuffix: true })}</span>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', lineHeight: 1.5, marginBottom: 8 }}>{a.title}</div>
              {a.snippet && <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{a.snippet.slice(0, 100)}…</div>}
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#aab5aa', marginTop: 48 }}>
          Not financial advice. For informational purposes only.
        </p>
      </div>
    </>
  )
}
