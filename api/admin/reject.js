// api/admin/reject.js
// POST { id, type } - butuh header x-admin-secret.
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const { id, type } = req.body || {};
    if (!id || !['daftar', 'login'].includes(type)) {
      return res.status(400).json({ error: 'Parameter id/type tidak valid.' });
    }
    const collection = type === 'daftar' ? 'pending_daftar' : 'pending_login';
    const ref = db().collection(collection).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Data tidak ditemukan.' });

    // Ditolak -> boleh daftar ulang dari awal, jadi hapus saja dokumennya (bukan hanya ditandai).
    await ref.delete();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menolak permintaan.' });
  }
};
