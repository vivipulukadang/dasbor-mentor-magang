'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleWeek, updateMonth, addNoteMentor, updatePesertaStatus, deletePeserta } from '@/lib/actions';
import { fmtDate, todayStr } from '@/lib/helpers';

export default function PesertaDetailClient({ peserta }) {
  const [tab, setTab] = useState('kurikulum');
  const [openMonth, setOpenMonth] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [, startTransition] = useTransition();
  const router = useRouter();

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleWeekToggle(week, checked) {
    await toggleWeek(week.id, checked, peserta.id);
    refresh();
  }
  async function handleMonthField(month, field, value) {
    await updateMonth(month.id, peserta.id, { [field]: value });
    refresh();
  }
  async function handleStatusChange(e) {
    await updatePesertaStatus(peserta.id, e.target.value);
    refresh();
  }
  async function handleDelete() {
    if (!confirm('Hapus peserta ini beserta seluruh catatannya?')) return;
    await deletePeserta(peserta.id);
  }
  async function handleAddNote() {
    if (!noteText.trim()) return;
    await addNoteMentor(peserta.id, noteText.trim());
    setNoteText('');
    refresh();
  }

  const bulan6 = peserta.months.find((m) => m.n === 6);
  const today = todayStr();

  return (
    <div className="view">
      <a className="back-link" href="/dashboard/peserta">← Kembali ke daftar peserta</a>

      <div className="detail-header">
        <div>
          <h2>{peserta.nama}</h2>
          <div className="sub">
            Administrasi & Yuridis Pertanahan · Mulai {fmtDate(peserta.mulai)} · Target selesai {bulan6 ? fmtDate(bulan6.end_date) : '-'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select defaultValue={peserta.status} onChange={handleStatusChange} style={{ width: 'auto' }}>
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
            <option value="mundur">Mengundurkan diri</option>
          </select>
          <button className="btn danger small" onClick={handleDelete}>Hapus</button>
        </div>
      </div>

      <div className="tab-strip">
        <div className={`subtab ${tab === 'kurikulum' ? 'active' : ''}`} onClick={() => setTab('kurikulum')}>Kurikulum 6 Bulan</div>
        <div className={`subtab ${tab === 'mingguan' ? 'active' : ''}`} onClick={() => setTab('mingguan')}>Checklist Mingguan</div>
        <div className={`subtab ${tab === 'catatan' ? 'active' : ''}`} onClick={() => setTab('catatan')}>Catatan</div>
      </div>

      {tab === 'kurikulum' && (
        <div>
          {peserta.months.map((m) => (
            <div className="accordion" key={m.id}>
              <div className="accordion-head" onClick={() => setOpenMonth(openMonth === m.id ? null : m.id)}>
                <div className="title">
                  Bulan {m.n} — {m.judul}{' '}
                  <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}>
                    ({fmtDate(m.start_date)} – {fmtDate(m.end_date)})
                  </span>
                </div>
                {m.evaluasi_done && <span className="stamp soft" style={{ transform: 'none' }}>Evaluasi Selesai</span>}
              </div>
              <div className={`accordion-body ${openMonth === m.id ? 'open' : ''}`}>
                <div className="form-row">
                  <label>Materi / Fokus Bulan Ini</label>
                  <textarea defaultValue={m.topik} onBlur={(e) => handleMonthField(m, 'topik', e.target.value)} />
                </div>
                <div className="check-row">
                  <input type="checkbox" defaultChecked={m.evaluasi_done} onChange={(e) => handleMonthField(m, 'evaluasi_done', e.target.checked)} />
                  <label>Evaluasi bulanan (8 aspek) sudah diisi di Monev</label>
                </div>
                <div className="check-row">
                  <input type="checkbox" defaultChecked={m.pembayaran_diajukan} onChange={(e) => handleMonthField(m, 'pembayaran_diajukan', e.target.checked)} />
                  <label>Usulan pembayaran uang saku sudah diajukan</label>
                </div>
                <div className="form-row">
                  <label>Catatan progres (opsional)</label>
                  <textarea defaultValue={m.catatan} onBlur={(e) => handleMonthField(m, 'catatan', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'mingguan' && (
        <div>
          <p className="section-sub">Centang setelah kamu approve laporan mingguan peserta di Monev.</p>
          <div className="week-grid">
            {peserta.weeks.map((w) => {
              const overdue = !w.approved && w.end_date <= today;
              const cls = w.approved ? 'done' : overdue ? 'pending' : '';
              return (
                <div className={`week-chip ${cls}`} key={w.id}>
                  <label>
                    <input type="checkbox" defaultChecked={w.approved} onChange={(e) => handleWeekToggle(w, e.target.checked)} />
                    Minggu {w.idx}
                  </label>
                  <span className="wk-range">{fmtDate(w.start_date)} – {fmtDate(w.end_date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'catatan' && (
        <div>
          <div className="notes-list">
            {peserta.notes.length === 0 && <div className="empty-note">Belum ada catatan.</div>}
            {peserta.notes.map((n) => (
              <div className="note-item" key={n.id}>
                <span className="date">{fmtDate(n.note_date)} · {n.author === 'mentor' ? 'Mentor' : 'Peserta'}</span>
                {n.text}
              </div>
            ))}
          </div>
          <div className="form-row">
            <label>Tambah catatan (sebagai mentor)</label>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} />
          </div>
          <button className="btn small" onClick={handleAddNote}>Simpan Catatan</button>
        </div>
      )}
    </div>
  );
}
