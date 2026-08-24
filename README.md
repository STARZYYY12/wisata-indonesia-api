# Wisata Indonesia API

SaaS penyedia data destinasi wisata Indonesia — pola seperti OpenRouter/WeatherAPI:
daftar akun → login (JWT) → buat API key → akses data pakai API key.

**Tech stack**: Express.js · PostgreSQL (Supabase) · Vercel (deploy)

---

## 1. Struktur Project

```
wisata-api/
├── api/index.js          # entry point untuk Vercel (serverless)
├── server.js              # Express app
├── db/
│   ├── pool.js             # koneksi PostgreSQL
│   └── schema.sql           # skema 5 tabel
├── middleware/
│   ├── authJwt.js           # verifikasi JWT
│   └── authApiKey.js        # verifikasi API key
├── controllers/            # logic auth, api-key, destinations
├── routes/                 # definisi endpoint
├── scripts/
│   ├── migrate.js          # jalankan schema.sql
│   └── seed.js              # isi 50 data destinasi + review
├── docs/                   # ERD, use case, activity diagram, laporan .docx
├── vercel.json
└── .env.example
```

## 2. Setup Database di Supabase (gratis)

1. Buat akun di https://supabase.com dan buat **New Project**.
2. Setelah project jadi, buka **Project Settings → Database → Connection string**,
   pilih mode **URI**, salin connection string-nya (format `postgresql://postgres:[PASSWORD]@...`).
3. Di local project, copy `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Isi `DATABASE_URL` dengan connection string dari Supabase, dan isi `JWT_SECRET`
   dengan string acak (boleh generate: `openssl rand -hex 32`).

## 3. Install & Migrasi (jalankan lokal dulu)

```bash
npm install
npm run migrate   # membuat 5 tabel di database
npm run seed       # mengisi 50 data destinasi wisata + review
```

Kalau berhasil akan muncul:
```
✅ Migrasi selesai. 5 tabel siap: users, api_keys, destinations, reviews, api_request_logs
✅ Seed selesai: 50 destinasi, ±150 review.
```

## 4. Jalankan Lokal

```bash
npm run dev
# server jalan di http://localhost:3000
```

Tes cepat:
```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","email":"budi@mail.com","password":"rahasia123"}'

# 2. Login -> dapat JWT
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@mail.com","password":"rahasia123"}'

# 3. Buat API key (pakai token dari langkah 2)
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer <TOKEN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"label":"key pertama"}'

# 4. Ambil data wisata (pakai api_key dari langkah 3)
curl "http://localhost:3000/api/v1/destinations?category=Pantai&limit=5" \
  -H "x-api-key: <API_KEY>"
```

## 5. Deploy ke Vercel

**Opsi A — lewat CLI**
```bash
npm i -g vercel
vercel login
vercel                # ikuti wizard, pilih "Link to existing project? No"
```
Saat prompt env var muncul, atau lewat dashboard, tambahkan:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (opsional, default `1d`)

Deploy production:
```bash
vercel --prod
```

**Opsi B — lewat GitHub + Dashboard Vercel**
1. Push project ini ke repo GitHub baru.
2. Buka https://vercel.com/new, import repo tersebut.
3. Di step "Environment Variables", tambahkan `DATABASE_URL` dan `JWT_SECRET`.
4. Klik **Deploy**. Vercel otomatis mendeteksi `vercel.json` dan menjalankan
   `api/index.js` sebagai serverless function.

> Migrasi & seed (`npm run migrate` / `npm run seed`) dijalankan **dari komputer lokal**
> yang tersambung ke `DATABASE_URL` Supabase yang sama — cukup dilakukan sekali di awal,
> tidak perlu dijalankan lagi di Vercel.

## 6. Dokumentasi

Lihat folder `docs/`:
- `Laporan_Wisata_Indonesia_API.docx` — laporan lengkap (ERD, Use Case Diagram, Activity Diagram/Userflow)
- `erd.png`, `usecase.png`, `activity.png` — gambar diagram individual

Endpoint lengkap juga bisa dilihat di `GET /api/docs` setelah server berjalan.
