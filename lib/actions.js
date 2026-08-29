'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateWeeksData, generateMonthsData } from '@/lib/helpers';

async function requireMentor(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Belum login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'mentor') throw new Error('Bukan mentor');
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function addPeserta(formData) {
  const supabase = await createClient();
  await requireMentor(supabase);

  const nama = formData.get('nama');
  const mulai = formData.get('mulai');
  const userId = formData.get('user_id')?.toString().trim() || null;

  const { data: peserta, error } = await supabase
    .from('peserta')
    .insert({ nama, mulai, status: 'aktif', user_id: userId })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('weeks').insert(generateWeeksData(peserta.id, mulai));
  await supabase.from('months').insert(generateMonthsData(peserta.id, mulai));

  revalidatePath('/dashboard/peserta');
  redirect('/dashboard/peserta');
}

export async function updatePesertaStatus(pesertaId, status) {
  const supabase = await createClient();
  await requireMentor(supabase);
  await supabase.from('peserta').update({ status }).eq('id', pesertaId);
  revalidatePath(`/dashboard/peserta/${pesertaId}`);
  revalidatePath('/dashboard');
}

export async function deletePeserta(pesertaId) {
  const supabase = await createClient();
  await requireMentor(supabase);
  await supabase.from('peserta').delete().eq('id', pesertaId);
  revalidatePath('/dashboard/peserta');
  redirect('/dashboard/peserta');
}

export async function toggleWeek(weekId, approved, pesertaId) {
  const supabase = await createClient();
  await requireMentor(supabase);
  await supabase.from('weeks').update({ approved }).eq('id', weekId);
  revalidatePath(`/dashboard/peserta/${pesertaId}`);
  revalidatePath('/dashboard');
}

export async function updateMonth(monthId, pesertaId, fields) {
  const supabase = await createClient();
  await requireMentor(supabase);
  await supabase.from('months').update(fields).eq('id', monthId);
  revalidatePath(`/dashboard/peserta/${pesertaId}`);
  revalidatePath('/dashboard');
}

export async function addNoteMentor(pesertaId, text) {
  const supabase = await createClient();
  await requireMentor(supabase);
  await supabase.from('notes').insert({
    peserta_id: pesertaId,
    author: 'mentor',
    text,
    note_date: new Date().toISOString().slice(0, 10),
  });
  revalidatePath(`/dashboard/peserta/${pesertaId}`);
}

// Dipakai oleh peserta yang login (bukan mentor) untuk nambah refleksi sendiri
export async function addNoteSelf(formData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Belum login');

  const { data: peserta } = await supabase
    .from('peserta')
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!peserta) throw new Error('Data peserta tidak ditemukan');

  const text = formData.get('text');
  await supabase.from('notes').insert({
    peserta_id: peserta.id,
    author: 'peserta',
    text,
    note_date: new Date().toISOString().slice(0, 10),
  });
  revalidatePath('/peserta');
}
