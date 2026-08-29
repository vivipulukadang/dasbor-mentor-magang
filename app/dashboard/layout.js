import { signOut } from '@/lib/actions';
import NavTabs from './NavTabs';

export default function DashboardLayout({ children }) {
  return (
    <div>
      <header className="letterhead">
        <div className="brand">
          <span className="kop">Kantor Pertanahan Kabupaten Bone Bolango · Seksi Penetapan Hak</span>
          <h1>Dasbor Kontrol Mentor</h1>
        </div>
        <form action={signOut}>
          <button className="btn secondary small" type="submit">Keluar</button>
        </form>
      </header>
      <NavTabs />
      <main>{children}</main>
    </div>
  );
}
