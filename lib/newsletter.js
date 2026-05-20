// lib/newsletter.js
// Generates a daily market newsletter digest from fetched articles
// Pure deterministic logic - no AI, no LLM

export function generateDailyNewsletter(articles, tickerStats, dateKey) {
  const topTickers = tickerStats.slice(0, 5)
  const topMovers = [...tickerStats]
    .filter(t => t.pct_change !== null)
    .sort((a, b) => Math.abs(b.pct_change) - Math.abs(a.pct_change))
    .slice(0, 3)

  const date = new Date(dateKey)
  const formatted = date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  // Group articles by mentioned tickers for the digest
  const articlesByTicker = {}
  for (const article of articles) {
    for (const ticker of (article.tickers || [])) {
      if (!articlesByTicker[ticker]) articlesByTicker[ticker] = []
      articlesByTicker[ticker].push(article)
    }
  }

  // Build newsletter sections
  const sections = []

  // --- Market overview ---
  const gainers = topMovers.filter(t => t.pct_change > 0)
  const losers = topMovers.filter(t => t.pct_change < 0)

  let overviewText = `Markets ${gainers.length > losers.length ? 'leaned bullish' : 'showed mixed signals'} today. `

  if (gainers.length > 0) {
    overviewText += `Notable gainers included ${gainers.map(t => `${t.ticker} (+${t.pct_change?.toFixed(2)}%)`).join(', ')}. `
  }
  if (losers.length > 0) {
    overviewText += `On the downside, ${losers.map(t => `${t.ticker} (${t.pct_change?.toFixed(2)}%)`).join(', ')} led declines.`
  }

  sections.push({
    heading: 'Market Overview',
    content: overviewText,
  })

  // --- Most talked about ---
  if (topTickers.length > 0) {
    const tickerList = topTickers
      .map(t => `**${t.ticker}** (${t.mentions} mention${t.mentions !== 1 ? 's' : ''})`)
      .join(', ')

    sections.push({
      heading: 'Most Discussed Today',
      content: `The stocks generating the most conversation today: ${tickerList}. Here's a quick look at what's driving the coverage.`,
    })
  }

  // --- Top story summaries (one per top ticker) ---
  for (const ticker of topTickers.slice(0, 4)) {
    const tickerArticles = articlesByTicker[ticker.ticker] || []
    if (tickerArticles.length === 0) continue

    const lead = tickerArticles[0]
    const priceStr = ticker.price
      ? ` (currently trading at $${ticker.price.toFixed(2)}, ${ticker.pct_change >= 0 ? '+' : ''}${ticker.pct_change?.toFixed(2)}%)`
      : ''

    sections.push({
      heading: `${ticker.ticker}${priceStr}`,
      content: `${lead.title}. ${lead.snippet || ''}${tickerArticles.length > 1 ? ` Plus ${tickerArticles.length - 1} more related ${tickerArticles.length - 1 === 1 ? 'story' : 'stories'}.` : ''}`,
      articleIds: tickerArticles.map(a => a.id),
    })
  }

  // --- Today's headlines count ---
  sections.push({
    heading: 'By the Numbers',
    content: `Today's digest covers ${articles.length} articles from sources including ${getTopSources(articles, 4).join(', ')}. ${topTickers.length} tickers were mentioned across today's financial coverage.`,
  })

  return {
    title: `Kabu Market Daily — ${formatted}`,
    source: 'Kabu Market',
    date_key: dateKey,
    content: JSON.stringify(sections),
    tickers: topTickers.map(t => t.ticker),
  }
}

function getTopSources(articles, n) {
  const counts = {}
  for (const a of articles) {
    counts[a.source] = (counts[a.source] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([src]) => src)
}
