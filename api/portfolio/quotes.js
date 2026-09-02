const { requireUser } = require("../lib/portfolio-auth");
const { getPortfolioMetrics, getQuote } = require("../lib/twelve-data");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method !== "GET") return response.status(405).json({ error: "Use GET for quotes." });
  const user = await requireUser(request, response);
  if (!user) return;

  try {
    if (request.query.includeMetrics === "1") {
      const metrics = await getPortfolioMetrics({
        symbol: request.query.symbol,
        instrumentType: request.query.instrumentType,
      });
      return response.status(200).json(metrics);
    }
    const quote = await getQuote({
      symbol: request.query.symbol,
      instrumentType: request.query.instrumentType,
    });
    return response.status(200).json(quote);
  } catch (error) {
    return response.status(422).json({ error: error.message });
  }
};
