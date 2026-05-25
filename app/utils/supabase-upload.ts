import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjmioptzuenhifplfiii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWlvcHR6dWVuaGlmcGxmaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzEwMTcsImV4cCI6MjA5NTI0NzAxN30.lVPktRw_jy4aBjx70Me6CQ00jr8VqjvdGYumgo2pBgE'

// ⚠️ Jangan expose ke client! Hanya untuk server-side (API routes)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client biasa (untuk client-side)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client admin (untuk server/API routes, bypass RLS)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function uploadProfilePhoto(base64: string, fileName: string) {
  const base64Data = base64.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  const { error } = await supabaseAdmin.storage  // ← pakai supabaseAdmin
    .from('photo')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('photo')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}
