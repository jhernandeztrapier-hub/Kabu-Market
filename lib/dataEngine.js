// lib/dataEngine.js

import { fetchAllFinancialNews } from './newsApi'
import { fetchQuotes, mockQuotes } from './stockApi'
import { extractTickers, countMentions } from './tickerExtractor'
import { generateDailyNewsletter } from './newsletter'
import {
  insertArticle,
  insertArticleTicker,
  upsertTickerDaily,
  insertNewsletter,
  getKnownTickerSet,
  toDateKey,
} from './db'

const CORE_TICKERS = [
  'AAPL','MSFT','NVDA','GOOGL','AMZN','TSLA','META','JPM','V','SPY',
  'QQQ','AMD','PLTR','LLY','NVO','BAC','GS','WMT','COST','COIN',
]

export async function runDailyUpdate(options = {}) {
  const { useMockPrices = !process.env.ALPHA_VANTAGE_KEY } = options
  const dateKey = toDateKey()
  const log = []
  const info = (msg) => { console.log('[Engine]', msg); log.push(msg) }

  info(`Starting daily update for ${dateKey}`)

  // 1. Load known tickers
  const knownTickerSet = await getKnownTickerSet()
  info(`Loaded ${knownTickerSet.size} known tickers`)

  // 2. Fetch news
  info('Fetching news...')
  const rawArticles = await fetchAllFinancialNews()
  info(`Got ${rawArticles.length} articles`)

  // 3. Store articles + extract tickers
  const storedArticles = []
  const allTexts = []

  for (const article of rawArticles) {
    const id = await insertArticle({ ...article, date_key: dateKey })
    if (id) {
      const text = `${article.title} ${article.snippet}`
      allTexts.push(text)
      const tickers = extractTickers(text, knownTickerSet)
      for (const ticker of tickers) {
        await insertArticleTicker(id, ticker)
      }
      storedArticles.push({ id, ...article, tickers })
    }
  }

  info(`Stored ${storedArticles.length} articles`)

  // 4. Count mentions
  const mentionCounts = countMentions(allTexts, knownTickerSet)
  info(`Found ${mentionCounts.length} mentioned tickers`)

  // 5. Determine tickers to fetch prices for
  const topMentioned = mentionCounts.slice(0, 20).map(m => m.ticker)
  const toFetch = [...new Set([...topMentioned, ...CORE_TICKERS])]

  // 6. Fetch prices
  info(`Fetching prices for ${toFetch.length} tickers...`)
  const quotes = useMockPrices
    ? mockQuotes(toFetch)
    : await fetchQuotes(toFetch, 20)

  info(`Got ${quotes.length} price quotes`)

  const priceMap = Object.fromEntries(quotes.map(q => [q.ticker, q]))
  const mentionMap = Object.fromEntries(mentionCounts.map(m => [m.ticker, m.count]))
  const allTickers = new Set([...mentionCounts.map(m => m.ticker), ...toFetch])

  // 7. Store ticker daily snapshots
  for (const ticker of allTickers) {
    const q = priceMap[ticker]
    await upsertTickerDaily(ticker, dateKey, {
      mentions: mentionMap[ticker] || 0,
      price: q?.price || null,
      price_change: q?.price_change || null,
      pct_change: q?.pct_change || null,
      volume: q?.volume || null,
    })
  }

  info(`Stored ${allTickers.size} ticker snapshots`)

  // 8. Generate and store daily newsletter
  const tickerStats = [...allTickers].map(ticker => ({
    ticker,
    mentions: mentionMap[ticker] || 0,
    price: priceMap[ticker]?.price || null,
    pct_change: priceMap[ticker]?.pct_change || null,
  })).sort((a, b) => b.mentions - a.mentions)

  const newsletter = generateDailyNewsletter(storedArticles, tickerStats, dateKey)
  await insertNewsletter(newsletter)
  info('Generated daily newsletter')

  info(`Daily update complete for ${dateKey}`)

  return {
    dateKey,
    articlesProcessed: rawArticles.length,
    articlesStored: storedArticles.length,
    tickersMentioned: mentionCounts.length,
    pricesFetched: quotes.length,
    log,
  }
}
