import { NextResponse } from "next/server";
import { app } from "@utils/firebase";
import { getDatabase, ref, get, set } from "firebase/database";

export async function POST(request: Request) {
  try {
    const matchData = await request.json();

    // ✅ Validasi field wajib
    const { id, player1, player2, winner, setScore } = matchData;
    if (!id || !player1 || !player2 || !winner || !setScore) {
      return NextResponse.json(
        { success: false, message: "Data pertandingan tidak lengkap" },
        { status: 400 }
      );
    }

    const db = getDatabase(app);
    const matchesRef = ref(db, "tenis-komedi/1/matches");

    const snapshot = await get(matchesRef);
    let currentMatches: typeof matchData[] = [];

    if (snapshot.exists()) {
      const val = snapshot.val();
      // ✅ Handle jika Firebase menyimpan sebagai object, bukan array
      currentMatches = (Array.isArray(val) ? val : Object.values(val)).filter(Boolean);
    }

    // ✅ Cegah duplikat ID
    const isDuplicate = currentMatches.some((m) => m.id === id);
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, message: "ID pertandingan sudah ada" },
        { status: 409 }
      );
    }

    const updatedMatches = [...currentMatches, matchData];
    await set(matchesRef, updatedMatches);

    return NextResponse.json({
      success: true,
      message: "Pertandingan berhasil disimpan",
      match: matchData,
    });
  } catch (error) {
    console.error("Error saving match:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data pertandingan" },
      { status: 500 }
    );
  }
}