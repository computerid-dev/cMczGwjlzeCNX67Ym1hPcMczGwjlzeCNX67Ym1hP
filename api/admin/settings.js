// api/admin/settings.js
// GET  - butuh header x-admin-secret. Balikin { enabled: bool } (mode auto).
// POST { enabled } - ubah mode auto ON/OFF.
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const ref = db().collection('settings').doc('auto');

  if (req.method === 'GET') {
    const doc = await ref.get();
    const enabled = doc.exists ? !!doc.data().enabled : false;
    return res.status(200).json({ enabled });
  }

  if (req.method === 'POST') {
    const { enabled } = req.body || {};
    await ref.set({ enabled: !!enabled });
    return res.status(200).json({ enabled: !!enabled });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
