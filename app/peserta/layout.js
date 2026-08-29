import { signOut } from '@/lib/actions';

export default function PesertaLayout({ children }) {
  return (
    <div>
      <header className="letterhead">
        <div className="brand">
          <span className="kop">Kantor Pertanahan Kabupaten Bone Bolango</span>
          <h1>Progres Pemagangan Saya</h1>
        </div>
        <form action={signOut}>
          <button className="btn secondary small" type="submit">Keluar</button>
        </form>
      </header>
      <main>{children}</main>
    </div>
  );
}
