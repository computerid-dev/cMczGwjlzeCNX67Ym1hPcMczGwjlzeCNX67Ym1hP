// api/admin/pending.js
// GET - butuh header x-admin-secret. Mengembalikan semua antrean pending (daftar + login).
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const [daftarSnap, loginSnap] = await Promise.all([
      db().collection('pending_daftar').where('status', '==', 'pending').get(),
      db().collection('pending_login').where('status', '==', 'pending').get(),
    ]);

    const daftar = daftarSnap.docs.map(d => ({ type: 'daftar', ...d.data() }));
    const login = loginSnap.docs.map(d => ({ type: 'login', ...d.data() }));

    const items = [...daftar, ...login].sort((a, b) => a.createdAt - b.createdAt);
    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal mengambil daftar pending.' });
  }
};
