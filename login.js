const c = require('crypto');
const { hash, token } = require('../../lib/auth');
module.exports = async (req, res) => {
  const ck = (v, age) => `fxl_admin=${v}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', ck('', 0)); return res.status(200).json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).end();
  const p = req.body && req.body.password;
  if (typeof p !== 'string' || !c.timingSafeEqual(hash(p), hash(process.env.ADMIN_PASSWORD))) return res.status(401).json({ error: 'Wrong password' });
  res.setHeader('Set-Cookie', ck(token(), 43200)); res.status(200).json({ ok: true });
};
