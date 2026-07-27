// api/admin/delete-post.js
// POST { postId } - butuh header x-admin-secret.
const { db, bucket } = require('../../lib/firebaseAdmin');
const { requireAdmin } = require('../../lib/helpers');

// Coba ekstrak path file di bucket dari URL hasil getDownloadURL() client SDK, biar filenya
// ikut dihapus dari Storage juga. Kalau gagal parse, lewati saja (best-effort, tidak fatal).
function extractStoragePath(mediaUrl) {
  try {
    const match = /\/o\/([^?]+)/.exec(mediaUrl);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const { postId } = req.body || {};
  if (!postId) return res.status(400).json({ error: 'Parameter postId wajib diisi.' });

  try {
    const postRef = db().collection('posts').doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) return res.status(404).json({ error: 'Post tidak ditemukan.' });
    const post = postDoc.data();

    // Hapus semua komentar di subcollection.
    const commentsSnap = await postRef.collection('comments').get();
    await Promise.all(commentsSnap.docs.map(d => d.ref.delete()));

    // Kurangi postCount penulis (kalau akunnya masih ada).
    const authorRef = db().collection('users').doc(post.authorId);
    const authorDoc = await authorRef.get();
    if (authorDoc.exists) {
      await authorRef.update({ postCount: Math.max(0, (authorDoc.data().postCount || 0) - 1) });
    }

    // Best-effort hapus file media dari Storage.
    if (post.mediaUrl) {
      const path = extractStoragePath(post.mediaUrl);
      if (path) await bucket().file(path).delete().catch(() => {});
    }

    await postRef.delete();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menghapus post.' });
  }
};
