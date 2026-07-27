// api/admin/users.js
// GET ?q=keyword(optional) - butuh header x-admin-secret. Daftar semua user (untuk kelola/ban).
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const snap = await db().collection('users').orderBy('createdAt', 'desc').limit(200).get();
    let users = snap.docs.map(d => ({
      id: d.id,
      username: d.data().username,
      email: d.data().email,
      phone: d.data().phone || '',
      displayName: d.data().displayName || '',
      banned: !!d.data().banned,
      followerCount: d.data().followerCount || 0,
      createdAt: d.data().createdAt,
    }));

    const q = (req.query.q || '').toLowerCase().trim();
    if (q) {
      users = users.filter(u =>
        u.username.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.displayName || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat daftar pengguna.' });
  }
};
