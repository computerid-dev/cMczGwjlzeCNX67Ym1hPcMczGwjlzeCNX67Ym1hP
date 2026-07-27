// api/admin/posts.js
// GET ?limit=30 - butuh header x-admin-secret. Post terbaru untuk dimoderasi.
const { db } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  try {
    const take = Math.min(Number(req.query.limit) || 30, 100);
    const snap = await db().collection('posts').orderBy('createdAt', 'desc').limit(take).get();
    const posts = snap.docs.map(d => d.data());

    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const authorDocs = await Promise.all(authorIds.map(id => db().collection('users').doc(id).get()));
    const authorMap = {};
    authorDocs.forEach(doc => {
      if (doc.exists) {
        const d = doc.data();
        authorMap[doc.id] = { username: d.username, displayName: d.displayName || d.username };
      }
    });

    const enriched = posts.map(p => ({ ...p, author: authorMap[p.authorId] || { username: '(dihapus)', displayName: '(dihapus)' } }));
    return res.status(200).json({ posts: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat post.' });
  }
};
