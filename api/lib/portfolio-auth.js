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
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
}

function requireUser(request, response) {
  return currentUser(request).then((user) => {
    if (user) return user;
    response.status(401).json({ error: "Sign in is required for brokerage data." });
    return null;
  });
}

module.exports = { currentUser, extractBearerToken, requireUser };
