// pages/api/cron/daily-update.js
// Vercel calls this automatically based on vercel.json schedule:
//   0 13 * * 1-5  → 9 AM ET (weekdays)
//   0 21 * * 1-5  → 5 PM ET (weekdays, market close prices)
//
// Vercel Hobby plan: crons run daily (once/day max)
// Vercel Pro plan:   crons run on full schedule above

import { runDailyUpdate } from '../../../lib/dataEngine'

export default async function handler(req, res) {
  // Vercel automatically sends this header for cron requests
  // It protects the endpoint from unauthorized external calls
  const cronSecret = req.headers['authorization']
  if (
    process.env.CRON_SECRET &&
    cronSecret !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('[Cron] daily-update triggered at', new Date().toISOString())

  try {
    const result = await runDailyUpdate()
    console.log('[Cron] Complete:', result)
    return res.status(200).json({ ok: true, result })
  } catch (err) {
    console.error('[Cron] Failed:', err)
    return res.status(500).json({ ok: false, error: err.message })
  }
}

// Tell Vercel this can run for up to 5 minutes (Pro plan)
export const config = {
  maxDuration: 300,
}
