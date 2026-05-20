-- ============================================================
-- KABU MARKET — Supabase Schema
-- Paste this entire file into your Supabase SQL Editor and run it.
-- Go to: supabase.com → your project → SQL Editor → New Query
-- ============================================================

-- Articles
create table if not exists articles (
  id          bigserial primary key,
  title       text not null,
  source      text,
  url         text unique,
  snippet     text,
  body        text,
  published   timestamptz,
  date_key    text,
  created_at  timestamptz default now()
);
create index if not exists idx_articles_date_key on articles(date_key);
create index if not exists idx_articles_published on articles(published desc);

-- Article <-> Ticker relationships
create table if not exists article_tickers (
  article_id  bigint references articles(id) on delete cascade,
  ticker      text not null,
  primary key (article_id, ticker)
);
create index if not exists idx_article_tickers_ticker on article_tickers(ticker);

-- Daily ticker snapshots
create table if not exists ticker_daily (
  id           bigserial primary key,
  ticker       text not null,
  date_key     text not null,
  mentions     integer default 0,
  price        numeric(12,4),
  price_change numeric(10,4),
  pct_change   numeric(8,4),
  volume       bigint,
  unique(ticker, date_key)
);
create index if not exists idx_ticker_daily_date on ticker_daily(date_key);
create index if not exists idx_ticker_daily_ticker on ticker_daily(ticker);

-- Daily newsletters
create table if not exists newsletters (
  id         bigserial primary key,
  title      text,
  source     text default 'Kabu Market',
  date_key   text not null,
  content    jsonb,
  tickers    text[],
  created_at timestamptz default now(),
  unique(source, date_key)
);
create index if not exists idx_newsletters_date on newsletters(date_key);

-- Known ticker reference list
create table if not exists known_tickers (
  ticker  text primary key,
  name    text,
  sector  text
);

-- Biggest movers helper function
create or replace function get_biggest_movers(p_date_key text, p_limit int)
returns setof ticker_daily
language sql stable as $$
  select * from ticker_daily
  where date_key = p_date_key
    and pct_change is not null
  order by abs(pct_change) desc
  limit p_limit;
$$;

-- ============================================================
-- SEED KNOWN TICKERS
-- ============================================================
insert into known_tickers (ticker, name, sector) values
  ('AAPL','Apple Inc.','Technology'),
  ('MSFT','Microsoft Corp.','Technology'),
  ('NVDA','NVIDIA Corp.','Technology'),
  ('GOOGL','Alphabet Inc.','Technology'),
  ('GOOG','Alphabet Inc.','Technology'),
  ('META','Meta Platforms Inc.','Technology'),
  ('AVGO','Broadcom Inc.','Technology'),
  ('ORCL','Oracle Corp.','Technology'),
  ('CRM','Salesforce Inc.','Technology'),
  ('ADBE','Adobe Inc.','Technology'),
  ('NOW','ServiceNow Inc.','Technology'),
  ('INTU','Intuit Inc.','Technology'),
  ('AMD','Advanced Micro Devices','Technology'),
  ('QCOM','Qualcomm Inc.','Technology'),
  ('TXN','Texas Instruments','Technology'),
  ('AMAT','Applied Materials','Technology'),
  ('KLAC','KLA Corp.','Technology'),
  ('LRCX','Lam Research','Technology'),
  ('IBM','IBM Corp.','Technology'),
  ('CSCO','Cisco Systems','Technology'),
  ('ACN','Accenture PLC','Technology'),
  ('TSM','Taiwan Semiconductor','Technology'),
  ('ASML','ASML Holding NV','Technology'),
  ('SAP','SAP SE','Technology'),
  ('PLTR','Palantir Technologies','Technology'),
  ('CRWD','CrowdStrike Holdings','Technology'),
  ('SNOW','Snowflake Inc.','Technology'),
  ('NET','Cloudflare Inc.','Technology'),
  ('DDOG','Datadog Inc.','Technology'),
  ('MDB','MongoDB Inc.','Technology'),
  ('ZS','Zscaler Inc.','Technology'),
  ('OKTA','Okta Inc.','Technology'),
  ('TWLO','Twilio Inc.','Technology'),
  ('UBER','Uber Technologies','Technology'),
  ('LYFT','Lyft Inc.','Technology'),
  ('TSLA','Tesla Inc.','Consumer Cyclical'),
  ('AMZN','Amazon.com Inc.','Consumer Cyclical'),
  ('NKE','Nike Inc.','Consumer Cyclical'),
  ('SBUX','Starbucks Corp.','Consumer Cyclical'),
  ('HD','Home Depot Inc.','Consumer Cyclical'),
  ('MCD',' McDonald''s Corp.','Consumer Cyclical'),
  ('LOW','Lowe''s Companies','Consumer Cyclical'),
  ('TJX','TJX Companies','Consumer Cyclical'),
  ('BKNG','Booking Holdings','Consumer Cyclical'),
  ('ABNB','Airbnb Inc.','Consumer Cyclical'),
  ('RIVN','Rivian Automotive','Consumer Cyclical'),
  ('LCID','Lucid Group','Consumer Cyclical'),
  ('GM','General Motors','Consumer Cyclical'),
  ('F','Ford Motor Co.','Consumer Cyclical'),
  ('MELI','MercadoLibre Inc.','Consumer Cyclical'),
  ('SHOP','Shopify Inc.','Consumer Cyclical'),
  ('JPM','JPMorgan Chase','Financials'),
  ('BAC','Bank of America','Financials'),
  ('GS','Goldman Sachs','Financials'),
  ('MS','Morgan Stanley','Financials'),
  ('WFC','Wells Fargo','Financials'),
  ('V','Visa Inc.','Financials'),
  ('MA','Mastercard Inc.','Financials'),
  ('AXP','American Express','Financials'),
  ('USB','US Bancorp','Financials'),
  ('COIN','Coinbase Global','Financials'),
  ('PYPL','PayPal Holdings','Financials'),
  ('SQ','Block Inc.','Financials'),
  ('HOOD','Robinhood Markets','Financials'),
  ('SOFI','SoFi Technologies','Financials'),
  ('CME','CME Group Inc.','Financials'),
  ('SPGI','S&P Global Inc.','Financials'),
  ('MCO','Moody''s Corp.','Financials'),
  ('LLY','Eli Lilly & Co.','Healthcare'),
  ('JNJ','Johnson & Johnson','Healthcare'),
  ('UNH','UnitedHealth Group','Healthcare'),
  ('PFE','Pfizer Inc.','Healthcare'),
  ('MRK','Merck & Co.','Healthcare'),
  ('ABBV','AbbVie Inc.','Healthcare'),
  ('TMO','Thermo Fisher Scientific','Healthcare'),
  ('ABT','Abbott Laboratories','Healthcare'),
  ('DHR','Danaher Corp.','Healthcare'),
  ('SYK','Stryker Corp.','Healthcare'),
  ('AMGN','Amgen Inc.','Healthcare'),
  ('GILD','Gilead Sciences','Healthcare'),
  ('REGN','Regeneron Pharmaceuticals','Healthcare'),
  ('VRTX','Vertex Pharmaceuticals','Healthcare'),
  ('ZTS','Zoetis Inc.','Healthcare'),
  ('ISRG','Intuitive Surgical','Healthcare'),
  ('CVS','CVS Health','Healthcare'),
  ('CI','Cigna Group','Healthcare'),
  ('NVO','Novo Nordisk','Healthcare'),
  ('XOM','Exxon Mobil','Energy'),
  ('CVX','Chevron Corp.','Energy'),
  ('COP','ConocoPhillips','Energy'),
  ('SLB','SLB (Schlumberger)','Energy'),
  ('EOG','EOG Resources','Energy'),
  ('MPC','Marathon Petroleum','Energy'),
  ('PSX','Phillips 66','Energy'),
  ('BP','BP PLC','Energy'),
  ('SHEL','Shell PLC','Energy'),
  ('WMT','Walmart Inc.','Consumer Staples'),
  ('COST','Costco Wholesale','Consumer Staples'),
  ('KO','Coca-Cola Co.','Consumer Staples'),
  ('PEP','PepsiCo Inc.','Consumer Staples'),
  ('PG','Procter & Gamble','Consumer Staples'),
  ('PM','Philip Morris','Consumer Staples'),
  ('MO','Altria Group','Consumer Staples'),
  ('MDLZ','Mondelez International','Consumer Staples'),
  ('CAT','Caterpillar Inc.','Industrials'),
  ('BA','Boeing Co.','Industrials'),
  ('GE','GE Aerospace','Industrials'),
  ('RTX','RTX Corp.','Industrials'),
  ('NOC','Northrop Grumman','Industrials'),
  ('LMT','Lockheed Martin','Industrials'),
  ('HON','Honeywell International','Industrials'),
  ('UPS','United Parcel Service','Industrials'),
  ('DE','Deere & Company','Industrials'),
  ('ITW','Illinois Tool Works','Industrials'),
  ('MMM','3M Co.','Industrials'),
  ('NEE','NextEra Energy','Utilities'),
  ('SO','Southern Company','Utilities'),
  ('DUK','Duke Energy','Utilities'),
  ('AEP','American Electric Power','Utilities'),
  ('PLD','Prologis Inc.','Real Estate'),
  ('AMT','American Tower','Real Estate'),
  ('SPY','SPDR S&P 500 ETF','ETF'),
  ('QQQ','Invesco QQQ Trust','ETF'),
  ('IWM','iShares Russell 2000','ETF'),
  ('GLD','SPDR Gold Shares','ETF'),
  ('SLV','iShares Silver Trust','ETF'),
  ('TLT','iShares 20+ Year Treasury','ETF'),
  ('VXX','iPath S&P 500 VIX','ETF'),
  ('BABA','Alibaba Group','Consumer Cyclical'),
  ('NIO','NIO Inc.','Consumer Cyclical'),
  ('XPEV','XPeng Inc.','Consumer Cyclical'),
  ('SE','Sea Limited','Technology'),
  ('BTC','Bitcoin','Crypto'),
  ('ETH','Ethereum','Crypto')
on conflict (ticker) do nothing;
