export function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const MONTH_TEMPLATE = [
  { n: 1, judul: 'Orientasi & Dasar Tugas Teknis', topik: 'Pengenalan organisasi ATR/BPN, budaya kerja ASN, kode etik, SOP pendaftaran tanah, dasar regulasi (Permen 18/2021 dkk).' },
  { n: 2, judul: 'Implementasi Teknis I', topik: 'Inventarisasi data yuridis berkas, pendampingan pengisian formulir pemohon, verifikasi kelengkapan dokumen.' },
  { n: 3, judul: 'Implementasi Teknis II', topik: 'Digitalisasi/scan berkas yuridis, sinkronisasi NUB, tata kelola penamaan file digital.' },
  { n: 4, judul: 'Implementasi Teknis III', topik: 'Cross-check substansi dasar bersama korsub, pengarsipan fisik & digital berkas.' },
  { n: 5, judul: 'Implementasi Teknis IV', topik: 'Mulai pegang berkas sederhana secara semi-mandiri di bawah supervisi.' },
  { n: 6, judul: 'Penutup & Evaluasi Akhir', topik: 'Penyelesaian target kerja, laporan akhir, kompilasi database, presentasi & evaluasi kompetensi.' },
];

export function generateWeeksData(pesertaId, mulai) {
  const rows = [];
  for (let i = 0; i < 26; i++) {
    rows.push({
      peserta_id: pesertaId,
      idx: i + 1,
      start_date: addDays(mulai, i * 7),
      end_date: addDays(mulai, i * 7 + 6),
      approved: false,
    });
  }
  return rows;
}

export function generateMonthsData(pesertaId, mulai) {
  return MONTH_TEMPLATE.map((m, i) => ({
    peserta_id: pesertaId,
    n: m.n,
    judul: m.judul,
    topik: m.topik,
    start_date: addDays(mulai, i * 30),
    end_date: addDays(mulai, i * 30 + 29),
    evaluasi_done: false,
    pembayaran_diajukan: false,
    catatan: '',
  }));
}

// items: {type, peserta, pid, label, date, overdue}
export function collectActionItems(pesertaList) {
  const today = todayStr();
  const items = [];

  pesertaList.filter(p => p.status === 'aktif').forEach(p => {
    (p.weeks || []).forEach(w => {
      if (!w.approved && w.end_date <= today) {
        items.push({
          type: 'mingguan',
          peserta: p.nama,
          pid: p.id,
          label: `Minggu ke-${w.idx} (${fmtDate(w.start_date)} – ${fmtDate(w.end_date)}) belum di-approve`,
          date: w.end_date,
          overdue: true,
        });
      }
    });

    (p.months || []).forEach(m => {
      if (!m.evaluasi_done && m.end_date <= today) {
        items.push({
          type: 'evaluasi',
          peserta: p.nama,
          pid: p.id,
          label: `Evaluasi Bulan ${m.n} belum diisi`,
          date: m.end_date,
          overdue: true,
        });
      }
      const payDeadline = addDays(m.end_date, 2);
      if (m.evaluasi_done && !m.pembayaran_diajukan && today >= m.end_date) {
        items.push({
          type: 'pembayaran',
          peserta: p.nama,
          pid: p.id,
          label: `Usulan pembayaran Bulan ${m.n} (target H+2 hari kerja: ${fmtDate(payDeadline)})`,
          date: payDeadline,
          overdue: today > payDeadline,
        });
      }
    });
  });

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}
