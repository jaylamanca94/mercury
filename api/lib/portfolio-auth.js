function extractBearerToken(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function currentUser(request) {
  const token = extractBearerToken(request);
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    signal: AbortSignal.timeout(10000),
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
  });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("Authentication is temporarily unavailable.");
  const user = await response.json();
  return typeof user?.id === "string" && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(user.id) ? user : null;
}

function requireUser(request, response) {
  return currentUser(request).then((user) => {
    if (user) return user;
    response.status(401).json({ error: "Sign in is required for brokerage data." });
    return null;
  }).catch(() => {
    response.status(503).json({ error: "Authentication is temporarily unavailable. Try again." });
    return null;
  });
}

module.exports = { currentUser, extractBearerToken, requireUser };
