// pages/api/trigger-update.js
// Hit this manually to seed data or force a refresh
// POST /api/trigger-update with header X-Update-Secret: your_secret

import { runDailyUpdate } from '../../lib/dataEngine'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const secret = req.headers['x-update-secret']
  if (process.env.UPDATE_SECRET && secret !== process.env.UPDATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await runDailyUpdate()
    return res.status(200).json({ ok: true, result })
  } catch (err) {
    console.error('[trigger-update]', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}

export const config = { maxDuration: 300 }
