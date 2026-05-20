// pages/api/newsletters.js
import { getLatestNewsletters } from '../../lib/db'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300')
  try {
    const newsletters = await getLatestNewsletters(30)
    return res.status(200).json({ newsletters })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
