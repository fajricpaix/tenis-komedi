import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, photoUrl, ...playerData } = data;

    // 1. Proses Simpan Foto jika ada
    let imgUrl = "/photo/default-avatar.png";
    if (photoUrl && photoUrl.startsWith('data:image')) {
      const base64Data = photoUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${Date.now()}-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      const filePath = path.join(process.cwd(), 'public', 'photo', fileName);
      
      await fs.writeFile(filePath, buffer);
      imgUrl = `/photo/${fileName}`;
    }

    // 2. Update teko.json
    const jsonPath = path.join(process.cwd(), 'public', 'json', 'teko.json');
    const fileData = await fs.readFile(jsonPath, 'utf8');
    const db = JSON.parse(fileData);

    const newPlayer = {
      id: db.players.length > 0 ? Math.max(...db.players.map((p: any) => p.id)) + 1 : 1,
      name,
      ...playerData,
      imgUrl
    };

    db.players.push(newPlayer);
    await fs.writeFile(jsonPath, JSON.stringify(db, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: "Pemain berhasil disimpan ke sistem",
      player: newPlayer 
    });

  } catch (error) {
    console.error("Error saving player:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data ke file JSON" },
      { status: 500 }
    );
  }
}