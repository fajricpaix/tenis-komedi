import { NextResponse } from "next/server";
import { app } from "@utils/firebase";
import { getDatabase, ref, get, set } from "firebase/database";
import { uploadMatchPhoto, deleteMatchPhoto } from "@utils/supabase-upload";

export async function POST(request: Request) {
  let uploadedFileName: string | null = null;

  try {
    const matchData = await request.json();

    // ✅ Validasi field wajib
    const { id, player1, player2, winner, setScore, pointScoresA, pointScoresB, photoUrl } = matchData;
    if (!id || !player1 || !player2 || !winner || !setScore) {
      return NextResponse.json(
        { success: false, message: "Data pertandingan tidak lengkap" },
        { status: 400 }
      );
    }

    // Jika photoUrl berisi base64, upload ke Supabase terlebih dahulu
    let finalPhotoUrl: string | undefined;
    if (typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
      uploadedFileName = `match_${id}_${Date.now()}.jpg`;
      finalPhotoUrl = await uploadMatchPhoto(photoUrl, uploadedFileName);
    } else if (typeof photoUrl === 'string' && photoUrl) {
      // Jika sudah berupa URL, gunakan langsung
      finalPhotoUrl = photoUrl;
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
      if (uploadedFileName) await deleteMatchPhoto(uploadedFileName);
      return NextResponse.json(
        { success: false, message: "ID pertandingan sudah ada" },
        { status: 409 }
      );
    }

    const matchToSave = {
      id,
      player1,
      player2,
      winner,
      setScore,
      ...(pointScoresA ? { pointScoresA } : {}),
      ...(pointScoresB ? { pointScoresB } : {}),
      ...(finalPhotoUrl ? { photoUrl: finalPhotoUrl } : {}),
    };

    const updatedMatches = [...currentMatches, matchToSave];
    await set(matchesRef, updatedMatches);

    return NextResponse.json({
      success: true,
      message: "Pertandingan berhasil disimpan",
      match: matchToSave,
    });
  } catch (error) {
    console.error("Error saving match:", error);
    if (uploadedFileName) {
      try {
        await deleteMatchPhoto(uploadedFileName);
      } catch (deleteError) {
        console.error("Rollback foto gagal:", deleteError);
      }
    }
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data pertandingan" },
      { status: 500 }
    );
  }
}