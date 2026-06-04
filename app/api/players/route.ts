// app/api/players/route.ts
import { NextResponse } from 'next/server';
import { app } from '@utils/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';
import { uploadProfilePhoto, deleteProfilePhoto } from '@utils/supabase-upload';

function generatePlayerId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `teko-${randomNum}`;
}

function sanitizeForFirebase(obj: unknown): unknown {
  if (obj === undefined || obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirebase(value);
    }
  }
  return result;
}

export async function DELETE(request: Request) {
  try {
    const { playerId, imgUrl } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { success: false, message: "ID pemain tidak ditemukan" },
        { status: 400 }
      );
    }

    const db = getDatabase(app);
    const playersRef = ref(db, 'tenis-komedi/0/players');

    const snapshot = await get(playersRef);
    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data pemain" },
        { status: 404 }
      );
    }

    const val = snapshot.val();
    const currentPlayers = Array.isArray(val) ? val : Object.values(val);
    const updatedPlayers = currentPlayers.filter(
      (p) => p !== null && p !== undefined && String(p.id) !== String(playerId)
    );

    if (imgUrl) {
      try {
        const urlParts = (imgUrl as string).split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) await deleteProfilePhoto(fileName);
      } catch (photoError) {
        console.error("Error deleting photo:", photoError);
      }
    }

    await set(playersRef, updatedPlayers.length > 0 ? updatedPlayers : []);

    return NextResponse.json({ success: true, message: "Pemain berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus pemain" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  let newUploadedFileName: string | null = null;

  try {
    const { playerId, playerData, newPhotoBase64, oldImgUrl } = await request.json();

    if (!playerId) {
      return NextResponse.json({ success: false, message: "ID pemain tidak ditemukan" }, { status: 400 });
    }

    const db = getDatabase(app);
    const playersRef = ref(db, 'tenis-komedi/0/players');

    const snapshot = await get(playersRef);
    if (!snapshot.exists()) {
      return NextResponse.json({ success: false, message: "Tidak ada data pemain" }, { status: 404 });
    }

    const val = snapshot.val();
    const currentPlayers = Array.isArray(val) ? val : Object.values(val);

    let imgUrl: string | undefined = undefined;

    if (newPhotoBase64 && newPhotoBase64.startsWith('data:')) {
      const safeName = playerData.name.replace(/\s+/g, '_').toLowerCase();
      newUploadedFileName = `${safeName}_${Date.now()}.jpg`;
      imgUrl = await uploadProfilePhoto(newPhotoBase64, newUploadedFileName);

      if (oldImgUrl) {
        try {
          const fileName = (oldImgUrl as string).split('/').pop();
          if (fileName) await deleteProfilePhoto(fileName);
        } catch (e) {
          console.error("Error deleting old photo:", e);
        }
      }
    }

    const updatedPlayers = currentPlayers.map((p) => {
      if (p !== null && p !== undefined && String((p as Record<string, unknown>).id) === String(playerId)) {
        const merged = {
          ...(p as object),
          ...playerData,
          id: (p as Record<string, unknown>).id,
          ...(imgUrl ? { imgUrl } : {}),
        };
        return sanitizeForFirebase(merged);
      }
      return p;
    });

    await set(playersRef, updatedPlayers);

    return NextResponse.json({ success: true, message: "Pemain berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating player:", error);

    if (newUploadedFileName) {
      try { await deleteProfilePhoto(newUploadedFileName); } catch (_) {}
    }

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui data pemain" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let uploadedFileName: string | null = null;

  try {
    const playerData = await request.json();
    const db = getDatabase(app);
    const playersRef = ref(db, 'tenis-komedi/0/players');

    // 1. Upload foto ke Supabase (jika ada)
    let imgUrl: string | undefined = undefined;

    if (playerData.photoUrl && playerData.photoUrl.startsWith('data:')) {
      const safeName = playerData.name.replace(/\s+/g, '_').toLowerCase();
      uploadedFileName = `${safeName}_${Date.now()}.jpg`;
      imgUrl = await uploadProfilePhoto(playerData.photoUrl, uploadedFileName);
    }

    // 2. Bersihkan data — hapus base64, tambah id & imgUrl
    const { photoUrl, ...playerWithoutBase64 } = playerData;
    const rawData = {
      id: generatePlayerId(),
      ...playerWithoutBase64,
      ...(imgUrl ? { imgUrl } : {}),
    };

    const finalPlayerData = sanitizeForFirebase(rawData);

    // 3. Ambil data pemain yang sudah ada, filter null akibat index loncat
    const snapshot = await get(playersRef);
    let currentPlayers: unknown[] = [];

    if (snapshot.exists()) {
      const val = snapshot.val();
      const raw = Array.isArray(val) ? val : Object.values(val);
      currentPlayers = raw.filter((item) => item !== null && item !== undefined);
    }

    // 4. Simpan ke Firebase — re-index bersih tanpa gap
    const cleanPlayers = [...currentPlayers, finalPlayerData].filter(
      (item) => item !== null && item !== undefined
    );

    await set(playersRef, cleanPlayers);

    return NextResponse.json({
      success: true,
      message: "Pemain berhasil disimpan",
      player: finalPlayerData,
    });

  } catch (error) {
    console.error("Error saving player:", error);

    // Rollback: hapus foto dari Supabase jika Firebase gagal
    if (uploadedFileName) {
      try {
        await deleteProfilePhoto(uploadedFileName);
        console.log("Rollback foto berhasil:", uploadedFileName);
      } catch (deleteError) {
        console.error("Rollback foto gagal:", deleteError);
      }
    }

    const message = error instanceof Error ? error.message : "Gagal menyimpan data pemain";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}