// utils/supabase-upload.ts
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = 'https://fjmioptzuenhifplfiii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbWlvcHR6dWVuaGlmcGxmaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzEwMTcsImV4cCI6MjA5NTI0NzAxN30.lVPktRw_jy4aBjx70Me6CQ00jr8VqjvdGYumgo2pBgE';

const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;   // 5MB — validasi input
const TARGET_SIZE_BYTES = 1 * 1024 * 1024;  // 1MB — batas ukuran output

async function compressToTarget(buffer: Buffer): Promise<Buffer> {
  const resized = await sharp(buffer)
    .resize(1080, 1080, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  let quality = 100;
  let compressed = resized;

  while (quality >= 20) {
    compressed = await sharp(resized)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();

    if (compressed.length <= TARGET_SIZE_BYTES) break;
    quality -= 5;
  }

  return compressed;
}

export async function uploadProfilePhoto(base64: string, fileName: string): Promise<string> {
  const base64Data = base64.split(',')[1];
  const originalBuffer = Buffer.from(base64Data, 'base64');

  // Validasi ukuran original (sebelum kompresi)
  if (originalBuffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Ukuran file melebihi 5MB');
  }

  // Kompresi
  const compressedBuffer = await compressToTarget(originalBuffer);

  // Upload ke Supabase (nama file selalu .jpg karena output sharp adalah jpeg)
  const safeFileName = fileName.replace(/\.[^.]+$/, '') + '.jpg';

  const { error } = await supabaseAdmin.storage
    .from('photo')
    .upload(safeFileName, compressedBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('photo')
    .getPublicUrl(safeFileName);

  return publicUrlData.publicUrl;
}

export async function uploadMatchPhoto(base64: string, fileName: string): Promise<string> {
  const base64Data = base64.split(',')[1];
  const originalBuffer = Buffer.from(base64Data, 'base64');

  if (originalBuffer.length > MAX_UPLOAD_BYTES) {
    throw new Error('Ukuran file melebihi 5MB');
  }

  const compressedBuffer = await compressToTarget(originalBuffer);
  const safeFileName = fileName.replace(/\.[^.]+$/, '') + '.jpg';

  const { error } = await supabaseAdmin.storage
    .from('matches')
    .upload(safeFileName, compressedBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('matches')
    .getPublicUrl(safeFileName);

  return publicUrlData.publicUrl;
}

export async function deleteProfilePhoto(fileName: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from('photo')
    .remove([fileName]);

  if (error) throw error;
}

export async function deleteMatchPhoto(fileName: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from('matches')
    .remove([fileName]);

  if (error) throw error;
}
