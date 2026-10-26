// Talks to Supabase over REST using the SERVER-ONLY service-role key (read from env, never sent to browsers).
exports.sb = (path, opt = {}) => fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, { ...opt,
  headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', ...opt.headers } });
