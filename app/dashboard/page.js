import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { collectActionItems } from '@/lib/helpers';

export default async function BerandaPage() {
  const supabase = await createClient();
  const { data: peserta } = await supabase
    .from('peserta')
    .select('*, weeks(*), months(*)')
    .order('nama');

  const list = peserta || [];
  const items = collectActionItems(list);
  const active = list.filter((p) => p.status === 'aktif').length;
  const overdue = items.filter((i) => i.overdue).length;

  return (
    <div className="view">
      <h2 className="section-title">Perlu Tindakan</h2>
      <p className="section-sub">Ringkasan hal yang menunggu keputusanmu sebagai mentor.</p>

      <div className="cards">
        <div className="stat-card">
          <div className="num">{active}</div>
          <div className="label">Peserta aktif dibimbing</div>
        </div>
        <div className={`stat-card ${overdue > 0 ? 'alert' : ''}`}>
          <div className="num">{overdue}</div>
          <div className="label">Item lewat tenggat</div>
        </div>
        <div className="stat-card">
          <div className="num">{items.length}</div>
          <div className="label">Total perlu tindakan</div>
        </div>
      </div>

      {items.length === 0 && <div className="empty-note">Tidak ada tindakan tertunda. Semua terkendali.</div>}

      <ul className="action-list">
        {items.map((it, i) => (
          <li className="action-item" key={i}>
            <div>
              <div className="who">{it.peserta}</div>
              <div className="what">{it.label}</div>
            </div>
            <div className="meta">
              {it.overdue ? <span className="stamp">Perlu Tindakan</span> : <span className="stamp soft">Mendekati</span>}
              <Link className="btn secondary small" href={`/dashboard/peserta/${it.pid}`}>Buka</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
