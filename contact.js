const { sb } = require('../lib/db');
const TYPES = ['General Inquiries', 'Tournaments & Scrims', 'Recruitment', 'Partnerships & Sponsorships'];
const cl = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot
  const d = { name: cl(b.name, 100), email: cl(b.email, 254), discord: cl(b.discord, 60) || null, inquiry_type: cl(b.inquiryType, 50), subject: cl(b.subject, 150), message: cl(b.message, 5000) };
  const err = !d.name ? 'Full name is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) ? 'A valid email address is required'
    : !TYPES.includes(d.inquiry_type) ? 'Please choose an inquiry type' : !d.subject ? 'Subject is required'
    : d.message.length < 10 ? 'Message must be at least 10 characters' : null;
  if (err) return res.status(400).json({ error: err });
  try { // id, created_at and status='New' are set by the database
    const r = await sb('contact_messages', { method: 'POST', body: JSON.stringify(d), headers: { Prefer: 'return=minimal' } });
    if (!r.ok) throw 0;
    return res.status(200).json({ ok: true });
  } catch { return res.status(500).json({ error: 'Could not save your message. Please try again.' }); }
};
