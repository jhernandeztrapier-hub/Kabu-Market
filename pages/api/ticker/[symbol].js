// pages/api/ticker/[symbol].js
import {
  getTickerInfo,
  getTickerLatestSnapshot,
  getTickerHistory,
  getTickerArticles,
} from '../../../lib/db'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
  const { symbol } = req.query
  if (!symbol) return res.status(400).json({ error: 'Missing symbol' })
  const ticker = symbol.toUpperCase()

  try {
    const [info, snapshot, history, articles] = await Promise.all([
      getTickerInfo(ticker),
      getTickerLatestSnapshot(ticker),
      getTickerHistory(ticker, 30),
      getTickerArticles(ticker, 20),
    ])

    return res.status(200).json({
      ticker,
      info: info || { ticker, name: ticker, sector: 'Unknown' },
      snapshot,
      history,
      articles,
    })
  } catch (err) {
    console.error(`[API/ticker/${ticker}]`, err)
    return res.status(500).json({ error: err.message })
  }
}
