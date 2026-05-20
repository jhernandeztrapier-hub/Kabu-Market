// lib/newsApi.js

const KEY = process.env.NEWSAPI_KEY
const BASE = 'https://newsapi.org/v2'

const QUERIES = [
  'stock market earnings',
  'Federal Reserve interest rates',
  'Wall Street NYSE NASDAQ',
  'tech stocks semiconductor',
  'S&P 500 market rally',
]

export async function fetchAllFinancialNews() {
  if (!KEY) {
    console.warn('[NewsAPI] No key - using mock data')
    return getMockArticles()
  }

  const all = []
  const seen = new Set()

  // Top business headlines
  try {
    const res = await fetch(
      `${BASE}/top-headlines?category=business&language=en&pageSize=50&apiKey=${KEY}`
    )
    const data = await res.json()
    for (const a of normalize(data.articles || [])) {
      if (!seen.has(a.url)) { seen.add(a.url); all.push(a) }
    }
  } catch (e) {
    console.error('[NewsAPI] headlines failed:', e.message)
  }

  // Everything queries
  for (const q of QUERIES) {
    try {
      await delay(300)
      const res = await fetch(
        `${BASE}/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${KEY}`
      )
      const data = await res.json()
      for (const a of normalize(data.articles || [])) {
        if (!seen.has(a.url)) { seen.add(a.url); all.push(a) }
      }
    } catch (e) {
      console.error(`[NewsAPI] "${q}" failed:`, e.message)
    }
  }

  return all.length > 0 ? all : getMockArticles()
}

function normalize(articles) {
  return articles
    .filter(a => a.title && a.title !== '[Removed]' && a.url)
    .map(a => ({
      title: a.title,
      source: a.source?.name || 'Unknown',
      url: a.url,
      snippet: a.description || a.content?.slice(0, 400) || '',
      published: a.publishedAt,
    }))
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function getMockArticles() {
  const now = new Date().toISOString()
  return [
    { title: 'NVIDIA Reports Record Revenue Driven by AI Chip Demand', source: 'Financial Times', url: 'https://ft.com/mock-nvda', snippet: 'NVDA shares surged after reporting Q4 earnings that beat Wall Street expectations across the data center segment.', published: now },
    { title: 'Tesla Deliveries Miss Q1 Estimates Amid EV Slowdown', source: 'Reuters', url: 'https://reuters.com/mock-tsla', snippet: 'TSLA delivered fewer vehicles than analysts expected, citing weaker consumer demand and increased competition from Chinese EV makers.', published: now },
    { title: 'Apple Eyes AI Features for iPhone 17 Launch', source: 'Bloomberg', url: 'https://bloomberg.com/mock-aapl', snippet: 'AAPL is planning a major push into generative AI features for its next iPhone cycle.', published: now },
    { title: 'Federal Reserve Holds Rates Steady, Signals Caution', source: 'Wall Street Journal', url: 'https://wsj.com/mock-fed', snippet: 'The Fed kept the federal funds rate unchanged, with Chair Powell noting inflation remains above the 2% target.', published: now },
    { title: 'Microsoft Azure Growth Accelerates on AI Cloud Demand', source: 'CNBC', url: 'https://cnbc.com/mock-msft', snippet: 'MSFT reported strong Azure cloud growth driven by enterprise AI adoption and raised its full-year guidance.', published: now },
    { title: 'Palantir Lands New DoD Contract Worth $480 Million', source: 'Defense News', url: 'https://defensenews.com/mock-pltr', snippet: 'PLTR secured another large government contract as its AI-driven analytics platform gains traction.', published: now },
    { title: 'AMD Gains Market Share in Data Center CPU Segment', source: 'The Verge', url: 'https://theverge.com/mock-amd', snippet: 'AMD continues to gain server CPU share from Intel with new EPYC processor generations.', published: now },
    { title: 'Meta Ad Revenue Up 27% YoY on Reels Engagement', source: "Barron's", url: 'https://barrons.com/mock-meta', snippet: 'META saw strong advertising revenue growth driven by Reels engagement and AI-powered ad targeting.', published: now },
    { title: 'Amazon AWS Wins Major Government Cloud Contract', source: 'TechCrunch', url: 'https://techcrunch.com/mock-amzn', snippet: 'AMZN subsidiary AWS secured a multi-billion dollar government IT modernization contract.', published: now },
    { title: 'S&P 500 Hits New Record as Tech Rally Continues', source: 'MarketWatch', url: 'https://marketwatch.com/mock-spy', snippet: 'The S&P 500 closed at record highs driven by strong earnings from major tech companies.', published: now },
    { title: 'Eli Lilly Mounjaro Sales Beat on Weight Loss Drug Demand', source: 'Reuters', url: 'https://reuters.com/mock-lly', snippet: 'LLY reported Mounjaro revenue well ahead of estimates as demand for GLP-1 drugs continues to surge.', published: now },
    { title: 'JPMorgan Sees Strong Consumer Spending in Q1 Data', source: 'Bloomberg', url: 'https://bloomberg.com/mock-jpm', snippet: 'JPM reported robust consumer credit card spending data through the first quarter.', published: now },
  ]
}
