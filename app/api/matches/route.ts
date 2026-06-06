import { NextResponse } from "next/server";
import { app } from "@utils/firebase";
import { getDatabase, ref, get, set } from "firebase/database";
import { uploadMatchPhoto, deleteMatchPhoto } from "@utils/supabase-upload";

export async function POST(request: Request) {
  let uploadedFileName: string | null = null;

  try {
    const matchData = await request.json();

    // ✅ Validasi field wajib
    const { id, player1, player2, winner, setScore, pointScoresA, pointScoresB, photoUrl, matchDate } = matchData;
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
      ...(matchDate ? { matchDate } : {}),
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

export async function PATCH(request: Request) {
  let newUploadedFileName: string | null = null;

  try {
    const { matchId, matchData, newPhotoBase64, oldPhotoUrl } = await request.json();

    if (!matchId) {
      return NextResponse.json({ success: false, message: "ID pertandingan tidak ditemukan" }, { status: 400 });
    }

    const db = getDatabase(app);
    const matchesRef = ref(db, "tenis-komedi/1/matches");
    const snapshot = await get(matchesRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ success: false, message: "Tidak ada data pertandingan" }, { status: 404 });
    }

    const val = snapshot.val();
    const currentMatches = (Array.isArray(val) ? val : Object.values(val)).filter(Boolean);

    let finalPhotoUrl: string | undefined;

    if (newPhotoBase64 && newPhotoBase64.startsWith("data:")) {
      newUploadedFileName = `match_${matchId}_${Date.now()}.jpg`;
      finalPhotoUrl = await uploadMatchPhoto(newPhotoBase64, newUploadedFileName);

      if (oldPhotoUrl) {
        try {
          const fileName = (oldPhotoUrl as string).split("/").pop();
          if (fileName) await deleteMatchPhoto(fileName);
        } catch (e) {
          console.error("Error deleting old match photo:", e);
        }
      }
    }

    const updatedMatches = currentMatches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          ...matchData,
          id: m.id,
          ...(finalPhotoUrl ? { photoUrl: finalPhotoUrl } : {}),
        };
      }
      return m;
    });

    await set(matchesRef, updatedMatches);

    return NextResponse.json({ success: true, message: "Pertandingan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating match:", error);
    if (newUploadedFileName) {
      try { await deleteMatchPhoto(newUploadedFileName); } catch (_) {}
    }
    return NextResponse.json({ success: false, message: "Gagal memperbarui pertandingan" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { matchId, photoUrl } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { success: false, message: "ID pertandingan tidak ditemukan" },
        { status: 400 }
      );
    }

    const db = getDatabase(app);
    const matchesRef = ref(db, "tenis-komedi/1/matches");

    const snapshot = await get(matchesRef);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data pertandingan" },
        { status: 404 }
      );
    }

    const val = snapshot.val();
    const currentMatches = Array.isArray(val) ? val : Object.values(val);
    const updatedMatches = currentMatches.filter((m) => m.id !== matchId);

    // ✅ Hapus foto dari Supabase jika ada
    if (photoUrl) {
      try {
        // Extract filename dari URL
        const urlParts = photoUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await deleteMatchPhoto(fileName);
        }
      } catch (photoError) {
        console.error("Error deleting photo:", photoError);
        // Lanjutkan delete meskipun foto gagal dihapus
      }
    }

    // Update Firebase dengan matches yang sudah difilter
    if (updatedMatches.length === 0) {
      // Jika tidak ada match lagi, set ke empty array
      await set(matchesRef, []);
    } else {
      await set(matchesRef, updatedMatches);
    }

    return NextResponse.json({
      success: true,
      message: "Pertandingan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus pertandingan" },
      { status: 500 }
    );
  }
}