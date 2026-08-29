import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PesertaDetailClient from './DetailClient';

export default async function PesertaDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: peserta } = await supabase
    .from('peserta')
    .select('*, weeks(*), months(*), notes(*)')
    .eq('id', id)
    .single();

  if (!peserta) notFound();

  peserta.weeks.sort((a, b) => a.idx - b.idx);
  peserta.months.sort((a, b) => a.n - b.n);
  peserta.notes.sort((a, b) => (a.note_date < b.note_date ? 1 : -1));

  return <PesertaDetailClient peserta={peserta} />;
}
