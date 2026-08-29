import { addPeserta } from '@/lib/actions';

export default function TambahPesertaPage() {
  return (
    <div className="view">
      <h2 className="section-title">Tambah Peserta</h2>
      <p className="section-sub">Kurikulum 6 bulan &amp; checklist 26 minggu akan otomatis dibuat berdasarkan tanggal mulai.</p>
      <form action={addPeserta} className="form-card">
        <div className="form-row">
          <label>Nama Peserta</label>
          <input type="text" name="nama" required />
        </div>
        <div className="form-row">
          <label>Tanggal Mulai Magang</label>
          <input type="date" name="mulai" required />
        </div>
        <div className="form-row">
          <label>User ID Supabase Auth (isi jika peserta ini punya akun login)</label>
          <input type="text" name="user_id" placeholder="UUID dari Authentication > Users" />
        </div>
        <button className="btn" type="submit">Simpan</button>
      </form>
    </div>
  );
}
