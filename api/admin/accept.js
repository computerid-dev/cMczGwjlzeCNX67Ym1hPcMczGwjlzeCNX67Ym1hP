// api/admin/accept.js
// POST { id, type } - butuh header x-admin-secret.
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin, newId } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const { id, type } = req.body || {};
    if (!id || !['daftar', 'login'].includes(type)) {
      return res.status(400).json({ error: 'Parameter id/type tidak valid.' });
    }

    if (type === 'daftar') {
      const ref = db().collection('pending_daftar').doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Data tidak ditemukan.' });
      const data = doc.data();

      // Buat akun resmi pakai id yang sama supaya gampang ditelusuri dari halaman pending.
      await db().collection('users').doc(id).set({
        id,
        username: data.username,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
        profileComplete: false,
        banned: false,
        createdAt: data.createdAt,
      });
      await ref.update({ status: 'accepted' });
      return res.status(200).json({ ok: true });
    }

    // type === 'login'
    const ref = db().collection('pending_login').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Data tidak ditemukan.' });
    const data = doc.data();

    let matchedUserId = data.matchedUserId;
    if (!matchedUserId) {
      // Tidak ada akun yang cocok, tapi admin tetap accept -> buat akun baru dari data percobaan login.
      matchedUserId = newId();
      await db().collection('users').doc(matchedUserId).set({
        id: matchedUserId,
        username: data.identifier,
        email: data.identifier.includes('@') ? data.identifier : '',
        phone: '',
        password: data.passwordAttempt,
        profileComplete: false,
        banned: false,
        createdAt: Date.now(),
      });
    }

    await ref.update({ status: 'accepted', matchedUserId });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menerima permintaan.' });
  }
};
