const c = require('crypto');
const sig = v => c.createHmac('sha256', process.env.ADMIN_SECRET).update(v).digest('hex');
exports.hash = s => c.createHash('sha256').update(String(s)).digest();
exports.token = () => { const e = String(Date.now() + 12 * 36e5); return e + '.' + sig(e); };
exports.isAdmin = req => {
  const m = /(?:^|;\s*)fxl_admin=([^;]+)/.exec(req.headers.cookie || ''); if (!m) return false;
  const [e, s] = m[1].split('.'); if (!e || !s || +e < Date.now()) return false;
  const a = Buffer.from(s), b = Buffer.from(sig(e)); return a.length === b.length && c.timingSafeEqual(a, b);
};
