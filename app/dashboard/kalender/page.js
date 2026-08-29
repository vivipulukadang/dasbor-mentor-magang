import { createClient } from '@/lib/supabase/server';
import { collectActionItems, fmtDate } from '@/lib/helpers';

export default async function KalenderPage() {
  const supabase = await createClient();
  const { data: peserta } = await supabase.from('peserta').select('*, weeks(*), months(*)');
  const items = collectActionItems(peserta || []);

  return (
    <div className="view">
      <h2 className="section-title">Kalender Deadline</h2>
      <p className="section-sub">Semua tenggat dari seluruh peserta aktif, diurutkan dari yang terdekat.</p>

      {items.length === 0 && <div className="empty-note">Tidak ada tenggat mendatang.</div>}

      {items.map((it, i) => (
        <div className="cal-item" key={i}>
          <div className="cal-date">{fmtDate(it.date)}</div>
          <div style={{ flex: 1 }}>
            <div className="who" style={{ fontWeight: 600, fontSize: 13 }}>{it.peserta}</div>
            <div className="what" style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{it.label}</div>
          </div>
          {it.overdue ? <span className="stamp">Lewat Tenggat</span> : <span className="stamp soft">Mendatang</span>}
        </div>
      ))}
    </div>
  );
}
