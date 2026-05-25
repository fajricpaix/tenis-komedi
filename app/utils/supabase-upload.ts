import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://fjmioptzuenhifplfiii.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWlvcHR6dWVuaGlmcGxmaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzEwMTcsImV4cCI6MjA5NTI0NzAxN30.lVPktRw_jy4aBjx70Me6CQ00jr8VqjvdGYumgo2pBgE'
);

export async function uploadProfilePhoto(base64: string, fileName: string) {
  // base64: "data:image/jpeg;base64,..."
  const base64Data = base64.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const { data, error } = await supabase.storage
    .from('photo')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) throw error;
  // Return public URL
  const { data: publicUrlData } = supabase.storage.from('photo').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}
