-- ============================================================
-- SCHEMA: Dasbor Mentor Pemagangan
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabel profil (role: mentor / peserta)
create table profiles (
  id uuid references auth.users(id) primary key,
  role text not null check (role in ('mentor','peserta')),
  nama text not null
);

-- 2. Tabel peserta magang
create table peserta (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  nama text not null,
  mulai date not null,
  status text not null default 'aktif' check (status in ('aktif','selesai','mundur')),
  created_at timestamptz default now()
);

-- 3. Checklist mingguan (26 minggu / 6 bulan)
create table weeks (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid references peserta(id) on delete cascade,
  idx int not null,
  start_date date not null,
  end_date date not null,
  approved boolean not null default false
);

-- 4. Kurikulum bulanan (6 bulan)
create table months (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid references peserta(id) on delete cascade,
  n int not null,
  judul text,
  topik text,
  start_date date not null,
  end_date date not null,
  evaluasi_done boolean not null default false,
  pembayaran_diajukan boolean not null default false,
  catatan text default ''
);

-- 5. Catatan/log (mentor & peserta)
create table notes (
  id uuid primary key default gen_random_uuid(),
  peserta_id uuid references peserta(id) on delete cascade,
  author text not null check (author in ('mentor','peserta')),
  note_date date not null default current_date,
  text text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Helper: cek apakah user yang login adalah mentor
-- security definer supaya tidak kena RLS saat query profiles
-- ============================================================
create or replace function is_mentor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1 from profiles where id = auth.uid() and role = 'mentor'
  );
$$;

-- ============================================================
-- RLS: aktifkan di semua tabel
-- ============================================================
alter table profiles enable row level security;
alter table peserta  enable row level security;
alter table weeks    enable row level security;
alter table months   enable row level security;
alter table notes    enable row level security;

-- ---- profiles ----
create policy "user baca profil sendiri" on profiles
  for select using (id = auth.uid());

create policy "mentor baca semua profil" on profiles
  for select using (is_mentor());

-- ---- peserta ----
create policy "mentor akses penuh peserta" on peserta
  for all using (is_mentor()) with check (is_mentor());

create policy "peserta baca data sendiri" on peserta
  for select using (user_id = auth.uid());

-- ---- weeks ----
create policy "mentor akses penuh weeks" on weeks
  for all using (is_mentor()) with check (is_mentor());

create policy "peserta baca weeks sendiri" on weeks
  for select using (
    peserta_id in (select id from peserta where user_id = auth.uid())
  );

-- ---- months ----
create policy "mentor akses penuh months" on months
  for all using (is_mentor()) with check (is_mentor());

create policy "peserta baca months sendiri" on months
  for select using (
    peserta_id in (select id from peserta where user_id = auth.uid())
  );

-- ---- notes ----
create policy "mentor akses penuh notes" on notes
  for all using (is_mentor()) with check (is_mentor());

create policy "peserta baca notes sendiri" on notes
  for select using (
    peserta_id in (select id from peserta where user_id = auth.uid())
  );

create policy "peserta tambah catatan sendiri" on notes
  for insert with check (
    author = 'peserta'
    and peserta_id in (select id from peserta where user_id = auth.uid())
  );

-- ============================================================
-- SEED: jalankan MANUAL setelah membuat 4 akun di Authentication
-- Ganti UUID di bawah dengan UUID asli dari Supabase Auth
-- ============================================================
insert into profiles (id, role, nama) values
  ('463de562-0c89-410a-9f1f-adbecfb6458b', 'mentor', 'Vivi'),
  ('600f28d3-542f-46e8-b8ab-584b1cb13977', 'peserta', 'Vvii');


