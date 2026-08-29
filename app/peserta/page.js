import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/helpers';
import { addNoteSelf } from '@/lib/actions';

export default async function PesertaHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: peserta } = await supabase
    .from('peserta')
    .select('*, weeks(*), months(*), notes(*)')
    .eq('user_id', user.id)
    .single();

  if (!peserta) {
    return (
      <div className="view">
        <div className="empty-note">Akunmu belum terhubung ke data peserta. Hubungi mentor.</div>
      </div>
    );
  }

  peserta.months.sort((a, b) => a.n - b.n);
  peserta.weeks.sort((a, b) => a.idx - b.idx);
  peserta.notes.sort((a, b) => (a.note_date < b.note_date ? 1 : -1));

  const approvedWeeks = peserta.weeks.filter((w) => w.approved).length;

  return (
    <div className="view">
      <h2 className="section-title">Halo, {peserta.nama}</h2>
      <p className="section-sub">
        Mulai {fmtDate(peserta.mulai)} · Status: {peserta.status} · Laporan mingguan disetujui: {approvedWeeks}/26
      </p>

      <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-deep)', fontSize: 16 }}>Kurikulum 6 Bulan</h3>
      {peserta.months.map((m) => (
        <div className="accordion" key={m.id}>
          <div className="accordion-head">
            <div className="title">Bulan {m.n} — {m.judul}</div>
            {m.evaluasi_done && <span className="stamp soft" style={{ transform: 'none' }}>Evaluasi Selesai</span>}
          </div>
          <div className="accordion-body open">
            <p style={{ fontSize: 13 }}>{m.topik}</p>
            {m.catatan && <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>Catatan mentor: {m.catatan}</p>}
          </div>
        </div>
      ))}

      <h3 style={{ fontFamily: 'Fraunces, serif', color: 'var(--green-deep)', fontSize: 16, marginTop: 24 }}>Catatan</h3>
      <div className="notes-list">
        {peserta.notes.length === 0 && <div className="empty-note">Belum ada catatan.</div>}
        {peserta.notes.map((n) => (
          <div className="note-item" key={n.id}>
            <span className="date">{fmtDate(n.note_date)} · {n.author === 'mentor' ? 'Mentor' : 'Kamu'}</span>
            {n.text}
          </div>
        ))}
      </div>

      <form action={addNoteSelf} className="form-row">
        <label>Tambah refleksi/catatan kamu</label>
        <textarea name="text" required />
        <button className="btn small" type="submit" style={{ marginTop: 8, width: 'fit-content' }}>Kirim</button>
      </form>
    </div>
  );
}
