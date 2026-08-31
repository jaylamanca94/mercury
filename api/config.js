module.exports = function handler(_request, response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  response.setHeader("Cache-Control", "no-store");
  if (!supabaseUrl || !supabaseAnonKey) {
    return response.status(503).json({ configured: false });
  }

  return response.status(200).json({ configured: true, supabaseUrl, supabaseAnonKey });
};
