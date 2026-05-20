// pages/newsletters.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/newsletters')
      .then(r => r.json())
      .then(d => {
        setNewsletters(d.newsletters || [])
        if (d.newsletters?.length > 0) setSelected(d.newsletters[0])
      })
      .finally(() => setLoading(false))
  }, [])

  const sections = selected?.content
    ? (typeof selected.content === 'string' ? JSON.parse(selected.content) : selected.content)
    : []

  return (
    <>
      <Head><title>Daily Newsletter — Kabu Market</title></Head>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 36, fontWeight: 400 }}>
            Daily <em style={{ color: '#1e4d2b' }}>digest.</em>
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
            Every weekday, Kabu Market compiles the most important market stories into one clean read.
          </p>
        </div>

        {loading && <div style={{ color: '#6b7280' }}>Loading newsletters…</div>}

        {!loading && newsletters.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 16, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 24, marginBottom: 10 }}>No newsletters yet</h2>
            <p style={{ color: '#6b7280' }}>The first digest will appear after the daily data update runs.</p>
          </div>
        )}

        {!loading && newsletters.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
            {/* Sidebar: past issues */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Past Issues</div>
              {newsletters.map(nl => (
                <div key={nl.id} onClick={() => setSelected(nl)}
                  style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', marginBottom: 6, background: selected?.id === nl.id ? '#d4e8d6' : '#fff', border: `1px solid ${selected?.id === nl.id ? '#1e4d2b' : '#e2ddd6'}`, transition: 'all 0.15s' }}
                  onMouseOver={e => { if (selected?.id !== nl.id) e.currentTarget.style.borderColor = '#1e4d2b' }}
                  onMouseOut={e => { if (selected?.id !== nl.id) e.currentTarget.style.borderColor = '#e2ddd6' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 3 }}>{nl.date_key}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{nl.title?.replace('Kabu Market Daily — ', '')}</div>
                  {nl.tickers?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {nl.tickers.slice(0, 4).map(t => (
                        <span key={t} style={{ fontSize: 10, fontWeight: 700, color: '#1e4d2b', background: '#d4e8d6', padding: '1px 6px', borderRadius: 8 }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Main: selected newsletter */}
            {selected && (
              <div style={{ background: '#fff', border: '1px solid #e2ddd6', borderRadius: 16, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: '#1e4d2b', padding: '28px 32px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    📰 Kabu Market Daily
                  </div>
                  <h2 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 28, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
                    {selected.title?.replace('Kabu Market Daily — ', '')}
                  </h2>
                  {selected.tickers?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                      {selected.tickers.map(t => (
                        <Link key={t} href={`/stock/${t}`}
                          style={{ fontSize: 11, fontWeight: 700, color: '#1e4d2b', background: 'rgba(255,255,255,0.9)', padding: '2px 10px', borderRadius: 20, textDecoration: 'none' }}>
                          {t}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '32px' }}>
                  {sections.map((section, i) => (
                    <div key={i} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: i < sections.length - 1 ? '1px solid #f0ece6' : 'none' }}>
                      <h3 style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontSize: 22, fontWeight: 400, color: '#1a1a1a', marginBottom: 12 }}>
                        {section.heading}
                      </h3>
                      <p style={{ fontSize: 15, color: '#2d2d2d', lineHeight: 1.8, marginBottom: section.articleIds?.length ? 16 : 0 }}>
                        {section.content}
                      </p>
                      {section.articleIds?.length > 0 && (
                        <Link href="/articles" style={{ fontSize: 13, fontWeight: 600, color: '#1e4d2b', textDecoration: 'none' }}>
                          Read related articles →
                        </Link>
                      )}
                    </div>
                  ))}

                  <div style={{ background: '#f7f5f0', borderRadius: 10, padding: '16px 20px', marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
                      This digest is generated automatically from financial news sources tracked by Kabu Market.
                      It is for informational purposes only and does not constitute financial advice.
                      Always do your own research before making investment decisions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
