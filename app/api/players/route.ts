import { NextResponse } from 'next/server';
import { app } from '@utils/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';

export async function POST(request: Request) {
  try {
    const playerData = await request.json();
    const db = getDatabase(app);
    const playersRef = ref(db, 'tenis-komedi/0/players');

    // 1. Ambil data pemain yang sudah ada
    const snapshot = await get(playersRef);
    let currentPlayers = [];
    
    if (snapshot.exists()) {
      currentPlayers = snapshot.val();
      // Pastikan data tetap berupa array
      if (!Array.isArray(currentPlayers)) {
        currentPlayers = Object.values(currentPlayers);
      }
    }

    // 2. Tambahkan pemain baru ke array
    const updatedPlayers = [...currentPlayers, playerData];

    // 3. Simpan kembali seluruh array ke path yang benar
    await set(playersRef, updatedPlayers);

    return NextResponse.json({
      success: true,
      message: "Pemain berhasil disimpan ke Realtime Database",
      player: playerData
    });

  } catch (error) {
    console.error("Error saving player:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data pemain" },
      { status: 500 }
    );
  }
}