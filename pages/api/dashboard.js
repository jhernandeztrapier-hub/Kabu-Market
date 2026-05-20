// pages/api/dashboard.js
import {
  getLatestDateKey,
  getTopTickersForDate,
  getBiggestMovers,
  getArticlesForDate,
  getAvailableDates,
  getNewslettersForDate,
} from '../../lib/db'

export default async function handler(req, res) {
  // Cache for 5 minutes on Vercel edge
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

  try {
    const dateKey = req.query.date || await getLatestDateKey()

    if (!dateKey) {
      return res.status(200).json({ isEmpty: true, dateKey: null })
    }

    const [topMentioned, biggestMovers, articles, newsletters, availableDates] = await Promise.all([
      getTopTickersForDate(dateKey, 12),
      getBiggestMovers(dateKey, 12),
      getArticlesForDate(dateKey, 30),
      getNewslettersForDate(dateKey),
      getAvailableDates(30),
    ])

    return res.status(200).json({
      dateKey,
      topMentioned,
      biggestMovers,
      articles,
      newsletters,
      availableDates,
      isEmpty: false,
    })
  } catch (err) {
    console.error('[API/dashboard]', err)
    return res.status(500).json({ error: err.message })
  }
}
