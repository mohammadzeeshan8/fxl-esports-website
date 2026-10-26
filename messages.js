const { sb } = require('../../lib/db');
const { isAdmin } = require('../../lib/auth');
const ST = ['New', 'Read', 'Replied', 'Archived'];
module.exports = async (req, res) => {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' }); // server-side authorization on every call
  try {
    if (req.method === 'GET') {
      const { q = '', status = 'inbox' } = req.query;
      const u = new URLSearchParams({ select: '*', order: 'created_at.desc', limit: '200' });
      if (status === 'inbox') u.set('status', 'neq.Archived'); else if (ST.includes(status)) u.set('status', 'eq.' + status);
      const s = String(q).replace(/[,()*%\\"]/g, '').trim();
      if (s) u.set('or', `(name.ilike.*${s}*,email.ilike.*${s}*,subject.ilike.*${s}*)`);
      const [list, cnt] = await Promise.all([sb('contact_messages?' + u), sb('contact_messages?select=id&status=eq.New&limit=1', { headers: { Prefer: 'count=exact' } })]);
      if (!list.ok) throw 0;
      const newCount = Number((cnt.headers.get('content-range') || '').split('/')[1]) || 0;
      return res.status(200).json({ messages: await list.json(), newCount });
    }
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!/^[0-9a-f-]{36}$/i.test(id || '') || !ST.includes(status)) return res.status(400).json({ error: 'Invalid request' });
      const r = await sb('contact_messages?id=eq.' + id, { method: 'PATCH', body: JSON.stringify({ status }), headers: { Prefer: 'return=minimal' } });
      return r.ok ? res.status(200).json({ ok: true }) : res.status(500).json({ error: 'Update failed' });
    }
    res.status(405).end();
  } catch { res.status(500).json({ error: 'Server error' }); }
};
