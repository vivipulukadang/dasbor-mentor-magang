// Delapan aspek penilaian MagangHub (Monev), skala SB / B / C / K.
export const ASPEK = [
  { key: 'kehadiran_disiplin', label: 'Kehadiran dan disiplin', dasar: 'kehadiran' },
  { key: 'sikap_perilaku', label: 'Sikap dan perilaku', dasar: 'mentor' },
  { key: 'komunikasi', label: 'Kemampuan komunikasi', dasar: 'mentor' },
  { key: 'inisiatif', label: 'Inisiatif dan tanggung jawab', dasar: 'mentor' },
  { key: 'adaptasi', label: 'Kemampuan adaptasi', dasar: 'mentor' },
  { key: 'pengetahuan_teknis', label: 'Pengetahuan teknis', dasar: 'mentor' },
  { key: 'produktivitas', label: 'Produktivitas dan ketepatan waktu', dasar: 'tugas' },
  { key: 'kerja_sama', label: 'Kerja sama tim', dasar: 'mentor' },
];

export const SKALA = ['SB', 'B', 'C', 'K'];

export const SKALA_LABEL = {
  SB: 'Sangat Baik',
  B: 'Baik',
  C: 'Cukup',
  K: 'Kurang',
};

export const KATEGORI_TUGAS = [
  'Administrasi',
  'Yuridis',
  'Digitalisasi',
  'Pelayanan',
  'Lainnya',
];

export const STATUS_KEHADIRAN = ['hadir', 'izin', 'sakit', 'alpa', 'libur'];

export const STATUS_KEHADIRAN_LABEL = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alpa: 'Tanpa keterangan',
  libur: 'Libur',
};

// Pintasan aplikasi pertanahan yang dipakai peserta sehari-hari.
export const PINTASAN = [
  {
    judul: 'Pintasan Aplikasi ATR/BPN',
    url: 'https://aplikasi.atrbpn.go.id/pintasan',
    ket: 'Gerbang ke seluruh aplikasi internal Kementerian ATR/BPN.',
  },
  {
    judul: 'Wakaf Sibolang',
    url: 'https://wakaf.sibolang.net/',
    ket: 'Basis data tanah wakaf.',
  },
  {
    judul: 'Perundang-undangan & Juknis',
    url: 'https://drive.google.com/drive/folders/186UTkHndyPGMCif7zAgy9BW1eiy8QXtt?usp=drive_link',
    ket: 'Kumpulan regulasi dan petunjuk teknis.',
  },
];

// Ambang batas untuk menerjemahkan persentase menjadi skala SB/B/C/K.
export function bandDariPersen(p) {
  if (p >= 95) return 'SB';
  if (p >= 85) return 'B';
  if (p >= 70) return 'C';
  return 'K';
}
