# EchoNote — Admin Panel

Panel buat kelola EchoNote: terima/tolak pendaftaran & percobaan login,
kelola/blokir pengguna, moderasi postingan, lihat trending.

Boleh online publik (gak perlu private/password-protect tambahan), tapi
**link-nya jangan disebar ke sembarang orang** — cukup dikasih ke orang yang
emang lu percaya buat bantu jadi admin kedua/ketiga. Siapapun yang tau link +
password (`ADMIN_SECRET`) di `lib/config.js`, otomatis bisa ikut nge-accept/
reject/ban/moderasi dari sini, tempatnya tetap satu ini aja.

## Setup — ZERO environment variable di Vercel

Semua kredensial diisi langsung di **satu file**: `lib/config.js`. Gak ada
apa-apa yang perlu di-setting di dashboard Vercel.

1. Buka `lib/config.js` di editor.
2. Isi 4 baris paling atas pakai data dari file JSON hasil "Generate new
   private key" di Firebase Console (Project Settings → Service Accounts):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_DATABASE_URL` (dari Firebase Console → Realtime Database)
3. Ganti `ADMIN_SECRET` jadi password sendiri (jangan dibiarin default).
4. Save.
5. Push ke repo GitHub — **pastikan repo-nya PRIVATE**, karena `config.js`
   sekarang isinya kredensial asli, bukan cuma placeholder.
6. Import repo ke Vercel → langsung klik **Deploy**, gak usah isi apa-apa lagi
   di step Environment Variables.
7. Buka URL yang dikasih Vercel → login pakai `ADMIN_SECRET` dari langkah 3.

## Kenapa repo harus PRIVATE sekarang?

Karena `lib/config.js` nyimpen `FIREBASE_PRIVATE_KEY` — ini kredensial yang
punya akses PENUH ke seluruh database (bisa hapus semua data, baca semua
password/email/no.telp user yang kesimpen plaintext). Kalau file ini kebaca
orang lain (misal repo ke-clone/bocor), abis semua. Makanya:
- Repo GitHub: **Private**, bukan Public.
- Jangan taruh `config.js` yang udah keisi di tempat lain (chat, cloud drive
  publik, dll).

## Yang TIDAK bisa dilakukan admin (by design, gak berubah)
- Gak bisa komen/like/posting sebagai user.
- Gak bisa masuk ke chat siapapun — chat end-to-end, panel ini sama sekali
  gak punya endpoint atau akses ke situ.
- Cuma bisa: lihat data, accept/reject antrean, ban/unban, hapus post, toggle
  mode auto.

## Struktur folder
```
Admin/
├── api/admin/       -> endpoint admin (accept, ban, delete-post, login,
│                       pending, posts, reject, settings, trending, users)
├── lib/
│   ├── config.js          -> SATU-SATUNYA file yang perlu diisi
│   ├── firebaseAdmin.js   -> baca config.js, konek ke Firebase
│   └── helpers.js
├── middleware.js    -> anti-scrape ringan
├── public/
│   ├── index.html   -> halaman login + dashboard admin (root "/")
│   ├── style.css
│   └── robots.txt
├── package.json
└── vercel.json
```
