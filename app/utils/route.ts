import { NextResponse } from 'next/server';
import { app } from '@utils/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';

export async function POST(request: Request) {
  try {
    const matchData = await request.json();
    const db = getDatabase(app);
    const matchesRef = ref(db, 'tenis-komedi/1/matches');

    // 1. Ambil data pertandingan yang sudah ada
    const snapshot = await get(matchesRef);
    let currentMatches = [];
    
    if (snapshot.exists()) {
      currentMatches = snapshot.val();
      // Pastikan data tetap berupa array
      if (!Array.isArray(currentMatches)) {
        currentMatches = Object.values(currentMatches);
      }
    }

    // 2. Tambahkan pertandingan baru ke array
    const updatedMatches = [...currentMatches, matchData];

    // 3. Simpan kembali seluruh array ke path yang benar (tenis-komedi/1/matches)
    await set(matchesRef, updatedMatches);

    return NextResponse.json({
      success: true,
      message: "Pertandingan berhasil disimpan ke Realtime Database",
      match: matchData
    });

  } catch (error) {
    console.error("Error saving match:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data pertandingan" },
      { status: 500 }
    );
  }
}