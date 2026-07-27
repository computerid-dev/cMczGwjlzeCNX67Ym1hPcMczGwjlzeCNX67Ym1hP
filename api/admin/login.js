// api/admin/login.js
// POST { secret } - cek password admin (env ADMIN_SECRET). Kalau cocok, frontend simpan
// secret ini di sessionStorage dan kirim sebagai header x-admin-secret di setiap request.
const config = require('../../lib/config');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { secret } = req.body || {};
  if (!secret || secret !== config.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Password admin salah.' });
  }
  return res.status(200).json({ ok: true });
};
