// lib/stockApi.js

const KEY = process.env.ALPHA_VANTAGE_KEY
const BASE = 'https://www.alphavantage.co/query'

export async function fetchQuote(ticker) {
  if (!KEY) return mockQuote(ticker)

  try {
    const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${KEY}`
    const res = await fetch(url)
    const data = await res.json()
    const q = data['Global Quote']
    if (!q || !q['05. price']) return null
    return {
      ticker,
      price: parseFloat(q['05. price']),
      price_change: parseFloat(q['09. change']),
      pct_change: parseFloat(q['10. change percent']?.replace('%', '')),
      volume: parseInt(q['06. volume'], 10),
    }
  } catch (e) {
    console.error(`[StockAPI] ${ticker}:`, e.message)
    return null
  }
}

// Fetch with rate limiting - AV free = 5/min
export async function fetchQuotes(tickers, max = 20) {
  const results = []
  const subset = tickers.slice(0, max)
  for (let i = 0; i < subset.length; i++) {
    const q = await fetchQuote(subset[i])
    if (q) results.push(q)
    if (i < subset.length - 1 && KEY) {
      await new Promise(r => setTimeout(r, 13000)) // 13s = safe for 5/min
    }
  }
  return results
}

export function mockQuotes(tickers) {
  return tickers.map(mockQuote)
}

function mockQuote(ticker) {
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const base = 50 + (seed % 900)
  const change = ((seed % 20) - 10) / 10 * (base * 0.03)
  return {
    ticker,
    price: parseFloat((base + change).toFixed(2)),
    price_change: parseFloat(change.toFixed(2)),
    pct_change: parseFloat(((change / base) * 100).toFixed(2)),
    volume: Math.floor(1000000 + (seed % 50000000)),
  }
}
