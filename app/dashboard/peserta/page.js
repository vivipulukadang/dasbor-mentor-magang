import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/helpers';

export default async function PesertaListPage() {
  const supabase = await createClient();
  const { data: peserta } = await supabase.from('peserta').select('*, months(*)').order('nama');
  const list = peserta || [];

  return (
    <div className="view">
      <div className="list-head">
        <div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Peserta Bimbingan</h2>
          <p className="section-sub" style={{ marginBottom: 0 }}>Posisi: Administrasi & Yuridis Pertanahan</p>
        </div>
        <Link className="btn" href="/dashboard/peserta/tambah">+ Tambah Peserta</Link>
      </div>

      <table>
        <thead>
          <tr><th>Nama</th><th>Mulai</th><th>Target Selesai</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((p) => {
            const bulan6 = (p.months || []).find((m) => m.n === 6);
            const statusClass = p.status === 'aktif' ? 'status-aktif' : p.status === 'selesai' ? 'status-selesai' : 'status-mundur';
            const statusLabel = p.status === 'aktif' ? 'Aktif' : p.status === 'selesai' ? 'Selesai' : 'Mengundurkan diri';
            return (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>{fmtDate(p.mulai)}</td>
                <td>{bulan6 ? fmtDate(bulan6.end_date) : '-'}</td>
                <td><span className={`status-pill ${statusClass}`}>{statusLabel}</span></td>
                <td><Link className="btn secondary small" href={`/dashboard/peserta/${p.id}`}>Detail →</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {list.length === 0 && <div className="empty-note" style={{ marginTop: 14 }}>Belum ada peserta. Klik &quot;Tambah Peserta&quot; untuk mulai.</div>}
    </div>
  );
}
