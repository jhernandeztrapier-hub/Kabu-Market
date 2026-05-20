// pages/api/search.js
import { searchArticles, searchTickers } from '../../lib/db'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60')
  const { q } = req.query
  if (!q?.trim()) return res.status(400).json({ error: 'Query required' })

  try {
    const [tickers, articles] = await Promise.all([
      searchTickers(q, 8),
      searchArticles(q, 15),
    ])
    return res.status(200).json({ query: q, tickers, articles })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
