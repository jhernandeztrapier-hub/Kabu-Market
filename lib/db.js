// lib/db.js
import { supabase } from './supabase'

export function toDateKey(date = new Date()) {
  return date.toISOString().split('T')[0]
}

// ---- Articles ----

export async function insertArticle(article) {
  const { data, error } = await supabase
    .from('articles')
    .upsert({
      title: article.title,
      source: article.source,
      url: article.url,
      snippet: article.snippet,
      body: article.body || null,
      published: article.published,
      date_key: article.date_key,
    }, { onConflict: 'url', ignoreDuplicates: true })
    .select('id')
    .single()

  if (error && error.code !== '23505') {
    console.error('[db] insertArticle error:', error.message)
    return null
  }
  return data?.id || null
}

export async function insertArticleTicker(articleId, ticker) {
  await supabase
    .from('article_tickers')
    .upsert({ article_id: articleId, ticker }, { onConflict: 'article_id,ticker', ignoreDuplicates: true })
}

export async function getArticlesForDate(dateKey, limit = 30) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, source, url, snippet, body, published, date_key,
      article_tickers ( ticker )
    `)
    .eq('date_key', dateKey)
    .order('published', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] getArticlesForDate:', error.message); return [] }
  return (data || []).map(normalizeArticle)
}

export async function getLatestArticles(limit = 30) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, source, url, snippet, body, published, date_key,
      article_tickers ( ticker )
    `)
    .order('published', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] getLatestArticles:', error.message); return [] }
  return (data || []).map(normalizeArticle)
}

export async function getArticleById(id) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, source, url, snippet, body, published, date_key,
      article_tickers ( ticker )
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return normalizeArticle(data)
}

export async function getTickerArticles(ticker, limit = 20) {
  const { data, error } = await supabase
    .from('article_tickers')
    .select(`
      articles (
        id, title, source, url, snippet, body, published, date_key,
        article_tickers ( ticker )
      )
    `)
    .eq('ticker', ticker)
    .order('articles(published)', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] getTickerArticles:', error.message); return [] }
  return (data || []).map(d => normalizeArticle(d.articles)).filter(Boolean)
}

export async function searchArticles(query, limit = 20) {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, source, url, snippet, body, published, date_key,
      article_tickers ( ticker )
    `)
    .or(`title.ilike.%${query}%,snippet.ilike.%${query}%`)
    .order('published', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] searchArticles:', error.message); return [] }
  return (data || []).map(normalizeArticle)
}

function normalizeArticle(a) {
  if (!a) return null
  return {
    ...a,
    tickers: (a.article_tickers || []).map(t => t.ticker),
    article_tickers: undefined,
  }
}

// ---- Ticker daily snapshots ----

export async function upsertTickerDaily(ticker, dateKey, data) {
  const { error } = await supabase
    .from('ticker_daily')
    .upsert({
      ticker,
      date_key: dateKey,
      mentions: data.mentions || 0,
      price: data.price || null,
      price_change: data.price_change || null,
      pct_change: data.pct_change || null,
      volume: data.volume || null,
    }, { onConflict: 'ticker,date_key' })

  if (error) console.error('[db] upsertTickerDaily:', error.message)
}

export async function getTopTickersForDate(dateKey, limit = 12) {
  const { data, error } = await supabase
    .from('ticker_daily')
    .select('*, known_tickers(name, sector)')
    .eq('date_key', dateKey)
    .order('mentions', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] getTopTickersForDate:', error.message); return [] }
  return (data || []).map(flattenTicker)
}

export async function getBiggestMovers(dateKey, limit = 12) {
  const { data, error } = await supabase
    .rpc('get_biggest_movers', { p_date_key: dateKey, p_limit: limit })

  if (error) {
    // Fallback: manual sort if RPC not set up yet
    const { data: d2 } = await supabase
      .from('ticker_daily')
      .select('*, known_tickers(name, sector)')
      .eq('date_key', dateKey)
      .not('pct_change', 'is', null)
      .limit(100)

    if (!d2) return []
    return d2
      .sort((a, b) => Math.abs(b.pct_change) - Math.abs(a.pct_change))
      .slice(0, limit)
      .map(flattenTicker)
  }
  return (data || []).map(flattenTicker)
}

export async function getTickerHistory(ticker, days = 30) {
  const { data, error } = await supabase
    .from('ticker_daily')
    .select('*')
    .eq('ticker', ticker)
    .order('date_key', { ascending: true })
    .limit(days)

  if (error) { console.error('[db] getTickerHistory:', error.message); return [] }
  return data || []
}

export async function getTickerLatestSnapshot(ticker) {
  const { data, error } = await supabase
    .from('ticker_daily')
    .select('*')
    .eq('ticker', ticker)
    .order('date_key', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data
}

export async function getLatestDateKey() {
  const { data, error } = await supabase
    .from('ticker_daily')
    .select('date_key')
    .order('date_key', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data?.date_key || null
}

export async function getAvailableDates(limit = 30) {
  const { data, error } = await supabase
    .from('ticker_daily')
    .select('date_key')
    .order('date_key', { ascending: false })
    .limit(limit * 20) // get enough rows to find distinct dates

  if (error) return []
  const unique = [...new Set((data || []).map(d => d.date_key))]
  return unique.slice(0, limit)
}

// ---- Known tickers ----

export async function getKnownTickerSet() {
  const { data, error } = await supabase
    .from('known_tickers')
    .select('ticker')

  if (error) { console.error('[db] getKnownTickerSet:', error.message); return new Set() }
  return new Set((data || []).map(r => r.ticker))
}

export async function getTickerInfo(ticker) {
  const { data, error } = await supabase
    .from('known_tickers')
    .select('*')
    .eq('ticker', ticker)
    .single()

  if (error) return null
  return data
}

export async function searchTickers(query, limit = 10) {
  const upper = query.toUpperCase()
  const { data, error } = await supabase
    .from('known_tickers')
    .select('ticker, name, sector')
    .or(`ticker.ilike.%${upper}%,name.ilike.%${query}%`)
    .limit(limit)

  if (error) { console.error('[db] searchTickers:', error.message); return [] }

  // Attach latest price data
  const results = []
  for (const t of data || []) {
    const snap = await getTickerLatestSnapshot(t.ticker)
    results.push({ ...t, ...snap })
  }
  return results
}

function flattenTicker(row) {
  return {
    ...row,
    name: row.known_tickers?.name || row.ticker,
    sector: row.known_tickers?.sector || 'Unknown',
    known_tickers: undefined,
  }
}

// ---- Newsletters ----

export async function insertNewsletter(nl) {
  const { data, error } = await supabase
    .from('newsletters')
    .upsert({
      title: nl.title,
      source: nl.source,
      date_key: nl.date_key,
      content: nl.content,
      tickers: nl.tickers || [],
    }, { onConflict: 'source,date_key', ignoreDuplicates: true })
    .select('id')
    .single()

  if (error && error.code !== '23505') {
    console.error('[db] insertNewsletter:', error.message)
    return null
  }
  return data?.id || null
}

export async function getNewslettersForDate(dateKey) {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('date_key', dateKey)
    .order('created_at', { ascending: false })

  if (error) { console.error('[db] getNewslettersForDate:', error.message); return [] }
  return data || []
}

export async function getLatestNewsletters(limit = 10) {
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .order('date_key', { ascending: false })
    .limit(limit)

  if (error) { console.error('[db] getLatestNewsletters:', error.message); return [] }
  return data || []
}
