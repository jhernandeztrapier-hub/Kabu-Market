// lib/tickerExtractor.js

const BLACKLIST = new Set([
  'THE','AND','FOR','ARE','BUT','NOT','YOU','ALL','CAN','HER','WAS','ONE',
  'OUR','OUT','DAY','GET','HAS','HIM','HIS','HOW','ITS','NEW','NOW','OLD',
  'SEE','TWO','WAY','WHO','DID','HAD','HIT','HOT','LOW','MAN','FAR','FEW',
  'GOT','LET','MAY','OWN','PUT','SAY','SHE','TOO','USE','VIA','YET','ANY',
  // Financial jargon
  'IPO','ETF','CEO','CFO','COO','CTO','ESG','GDP','CPI','PPI','PMI','EPS',
  'PE','ROI','ROE','FCF','EV','EBIT','EBITDA','YOY','QOQ','YTD','ATH','ATL',
  'RSI','EMA','MACD','SMA','VWAP','ICO','NFT','DAO','APY','APR','TVL','AUM',
  'NAV','VIX','CBOE','NYSE','AMEX','SEC','FED','FOMC','ECB','IMF','WTO',
  'IRS','DOJ','DOE','DOD','FDA','FTC','FCC','OCC','FDIC','CFTC','FINRA',
  // Currencies / geo
  'USD','EUR','GBP','JPY','CNY','CAD','AUD','CHF','HKD','SGD','INR','MXN',
  'BRL','KRW','TWD','RUB','TRY','SAR','USA','UK','EU','UN','UAE','NATO','OPEC',
  // Time
  'AM','PM','EST','EDT','CST','PST','GMT','UTC','JAN','FEB','MAR','APR',
  'JUN','JUL','AUG','SEP','OCT','NOV','DEC','MON','TUE','WED','THU','FRI',
  'SAT','SUN','Q1','Q2','Q3','Q4','H1','H2',
  // Tech/misc
  'AI','ML','API','AWS','GCP','CDN','UI','UX','CRM','ERP','SLA','MVP','KPI',
  'OKR','IT','ICT','RPA','IOT','AR','VR','XR','IPR',
  // Single letters
  'A','B','C','D','E','I','K','M','N','O','P','Q','R','S','T','W','X','Y','Z',
])

export function extractTickers(text, knownTickerSet) {
  if (!text) return []
  const pattern = /\$([A-Z]{1,5})\b|(?<![a-z])([A-Z]{2,5})(?![a-z])/g
  const found = new Set()
  let match
  while ((match = pattern.exec(text)) !== null) {
    const t = match[1] || match[2]
    if (t && !BLACKLIST.has(t) && knownTickerSet.has(t)) {
      found.add(t)
    }
  }
  return [...found]
}

export function countMentions(texts, knownTickerSet) {
  const counts = {}
  for (const text of texts) {
    for (const ticker of extractTickers(text, knownTickerSet)) {
      counts[ticker] = (counts[ticker] || 0) + 1
    }
  }
  return Object.entries(counts)
    .map(([ticker, count]) => ({ ticker, count }))
    .sort((a, b) => b.count - a.count)
}
