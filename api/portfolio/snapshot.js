const { currentUser } = require("../lib/portfolio-auth");

function newYorkDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).reduce((memo, part) => ({ ...memo, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isAfterMarketClose(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", hour: "2-digit", hourCycle: "h23",
  }).format(now));
  return hour >= 16;
}

function latestQuotes(quotes) {
  return quotes.reduce((latest, quote) => {
    if (!latest[quote.holding_id] || new Date(quote.as_of) > new Date(latest[quote.holding_id].as_of)) {
      latest[quote.holding_id] = quote;
    }
    return latest;
  }, {});
}

function totalValueCents(holdings, quotes) {
  const quoteByHolding = latestQuotes(quotes);
  return holdings.reduce((total, holding) => {
    if (holding.valuation_basis === "manual-value") return total + holding.manual_value_cents;
    const quote = quoteByHolding[holding.id];
    const unitPrice = quote?.price_cents ?? holding.manual_price_cents;
    return total + (unitPrice === null || unitPrice === undefined ? 0 : Math.round(Number(holding.shares) * unitPrice));
  }, 0);
}

async function supabase(path, { method = "GET", body } = {}) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error("Snapshot storage is unavailable.");
  return response.json();
}

async function recordAccountSnapshot(account) {
  const holdings = await supabase(`holdings?account_id=eq.${account.id}&select=id,valuation_basis,manual_value_cents,manual_price_cents,shares`);
  const ids = holdings.map((holding) => holding.id);
  const quotes = ids.length
    ? await supabase(`holding_quotes?holding_id=in.(${ids.join(",")})&select=holding_id,price_cents,as_of`)
    : [];
  const total = totalValueCents(holdings, quotes);
  const snapshotDate = newYorkDate();
  const created = await supabase("portfolio_snapshots?on_conflict=account_id,snapshot_date", {
    method: "POST",
    body: [{ account_id: account.id, snapshot_date: snapshotDate, total_value_cents: total, recorded_at: new Date().toISOString() }],
  });
  return created[0];
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  const isCron = request.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
  const user = isCron ? null : await currentUser(request);
  if (!isCron && !user) return response.status(401).json({ error: "Sign in is required to refresh history." });
  if (request.method !== "POST" && request.method !== "GET") return response.status(405).json({ error: "Use POST or scheduled GET." });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return response.status(503).json({ error: "Snapshots are not configured yet." });
  if (isCron && !isAfterMarketClose()) return response.status(202).json({ skipped: true, reason: "Awaiting New York market close." });

  try {
    const accountFilter = user ? `&user_id=eq.${user.id}` : "";
    const accounts = await supabase(`accounts?account_type=eq.brokerage${accountFilter}&select=id,user_id`);
    const snapshots = await Promise.all(accounts.map(recordAccountSnapshot));
    return response.status(200).json({ snapshots, snapshotDate: newYorkDate() });
  } catch (error) {
    return response.status(503).json({ error: error.message });
  }
};

module.exports._internals = { isAfterMarketClose, latestQuotes, newYorkDate, totalValueCents };
