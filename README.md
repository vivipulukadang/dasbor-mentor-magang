# Dasbor Mentor Pemagangan — Setup

4 akun: 1 mentor (akses penuh), 3 peserta (baca data sendiri + tambah catatan sendiri).

## 1. Supabase

1. Buat project baru di https://supabase.com/dashboard
2. Buka **SQL Editor** → paste isi `supabase/schema.sql` → Run
3. Buka **Authentication > Users** → **Add user** (email + password) sebanyak 4x: 1 untuk kamu (mentor), 3 untuk peserta
4. Copy **User UID** masing-masing dari daftar user
5. Balik ke **SQL Editor**, jalankan (ganti UUID & nama sesuai user yang baru dibuat):
   ```sql
   insert into profiles (id, role, nama) values
     ('uuid-akun-mentor', 'mentor', 'Nama Kamu'),
     ('uuid-akun-peserta-1', 'peserta', 'Nama Peserta 1'),
     ('uuid-akun-peserta-2', 'peserta', 'Nama Peserta 2'),
     ('uuid-akun-peserta-3', 'peserta', 'Nama Peserta 3');
   ```
6. Buka **Project Settings > API** → catat `Project URL` dan `anon public key`

## 2. Push ke GitHub

```bash
cd mentor-dashboard
git init
git add .
git commit -m "init dasbor mentor"
gh repo create dasbor-mentor-magang --private --source=. --push
```
(atau bikin repo manual di github.com lalu `git remote add origin <url>` → `git push -u origin main`)

## 3. Deploy ke Vercel

1. https://vercel.com/new → import repo `dasbor-mentor-magang`
2. Di **Environment Variables**, isi:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL dari langkah 1.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key dari langkah 1.6
3. Deploy

## 4. Hubungkan tiap peserta ke data mereka

Di dashboard mentor → **Peserta > Tambah Peserta** → isi nama, tanggal mulai, dan **User ID** = UUID akun peserta yang bersangkutan (dari langkah 1.4). Tanpa User ID, peserta tidak akan bisa melihat datanya sendiri.

## Lokal (opsional, untuk coba sebelum deploy)

```bash
cp .env.local.example .env.local   # isi dengan URL & anon key
npm install
npm run dev
```
Buka http://localhost:3000

## Struktur

- `/login` — halaman masuk (semua role)
- `/dashboard/*` — khusus role mentor (Beranda, Peserta, Kalender)
- `/peserta` — khusus role peserta, hanya baca data sendiri (RLS di database, bukan cuma di UI)
- `supabase/schema.sql` — tabel + Row Level Security policy
