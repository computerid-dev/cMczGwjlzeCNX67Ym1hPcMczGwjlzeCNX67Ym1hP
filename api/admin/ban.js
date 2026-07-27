// api/admin/ban.js
// POST { userId, banned: true|false } - butuh header x-admin-secret.
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const { userId, banned } = req.body || {};
  if (!userId || typeof banned !== 'boolean') {
    return res.status(400).json({ error: 'Parameter userId/banned tidak valid.' });
  }

  try {
    const ref = db().collection('users').doc(userId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });

    await ref.update({ banned });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memperbarui status ban.' });
  }
};
