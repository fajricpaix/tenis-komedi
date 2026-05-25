// app/api/players/route.ts
import { NextResponse } from 'next/server';
import { app } from '@utils/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';
import { uploadProfilePhoto } from '@utils/supabase-upload';

// Generate ID format: teko-XXXXX (5 digit angka random)
function generatePlayerId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000); // selalu 5 digit
  return `teko-${randomNum}`;
}

export async function POST(request: Request) {
  try {
    const playerData = await request.json();
    const db = getDatabase(app);
    const playersRef = ref(db, 'tenis-komedi/0/players');

    // 1. Upload foto ke Supabase Storage (jika ada)
    let imgUrl: string | undefined = undefined;

    if (playerData.photoUrl && playerData.photoUrl.startsWith('data:')) {
      const safeName = playerData.name.replace(/\s+/g, '_').toLowerCase();
      const fileName = `${safeName}_${Date.now()}.jpg`;
      imgUrl = await uploadProfilePhoto(playerData.photoUrl, fileName);
    }

    // 2. Hapus base64, ganti dengan imgUrl + tambahkan id
    const { photoUrl, ...playerWithoutBase64 } = playerData;
    const finalPlayerData = {
      id: generatePlayerId(),        // ← ID baru
      ...playerWithoutBase64,
      ...(imgUrl ? { imgUrl } : {}),
    };

    // 3. Ambil data pemain yang sudah ada
    const snapshot = await get(playersRef);
    let currentPlayers = [];

    if (snapshot.exists()) {
      currentPlayers = snapshot.val();
      if (!Array.isArray(currentPlayers)) {
        currentPlayers = Object.values(currentPlayers);
      }
    }

    // 4. Simpan ke Firebase
    const updatedPlayers = [...currentPlayers, finalPlayerData];
    await set(playersRef, updatedPlayers);

    return NextResponse.json({
      success: true,
      message: "Pemain berhasil disimpan",
      player: finalPlayerData,
    });

  } catch (error) {
    console.error("Error saving player:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data pemain" },
      { status: 500 }
    );
  }
}