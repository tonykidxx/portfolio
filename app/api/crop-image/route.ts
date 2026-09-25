import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      imageUrl,
      mode = "manual", // 'manual' | 'auto-trim'
      zoom = 1.0,
      offsetX = 0, // percentage -50 to 50
      offsetY = 0, // percentage -50 to 50
      isVertical = false,
      threshold = 25,
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "URL da imagem não fornecida." }, { status: 400 });
    }

    let inputBuffer: Buffer;

    // Carregar buffer da imagem (seja arquivo local em /uploads ou URL remota)
    if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("uploads/")) {
      const relativePath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
      const localFilePath = path.join(process.cwd(), "public", relativePath);
      inputBuffer = await readFile(localFilePath);
    } else if (imageUrl.startsWith("data:image/")) {
      const base64Data = imageUrl.split(",")[1];
      inputBuffer = Buffer.from(base64Data, "base64");
    } else {
      // URL externa (YouTube, CDN, etc)
      const res = await fetch(imageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!res.ok) {
        throw new Error(`Falha ao baixar imagem remota (status ${res.status}).`);
      }
      const arrayBuf = await res.arrayBuffer();
      inputBuffer = Buffer.from(arrayBuf);
    }

    const targetW = isVertical ? 720 : 1280;
    const targetH = isVertical ? 1280 : 720;

    let outputBuffer: Buffer;

    if (mode === "auto-trim") {
      // Remoção automática de tarjas pretas detectando bordas escuras
      try {
        const trimmedBuffer = await sharp(inputBuffer)
          .trim({
            background: "#000000",
            threshold: Number(threshold) || 25,
          })
          .toBuffer();

        outputBuffer = await sharp(trimmedBuffer)
          .resize(targetW, targetH, {
            fit: "cover",
            position: "center",
          })
          .jpeg({ quality: 92, mozjpeg: true })
          .toBuffer();
      } catch (trimErr) {
        // Se o trim falhar (por exemplo, imagem sem tarjas), aplica resize cover direto
        outputBuffer = await sharp(inputBuffer)
          .resize(targetW, targetH, {
            fit: "cover",
            position: "center",
          })
          .jpeg({ quality: 92, mozjpeg: true })
          .toBuffer();
      }
    } else {
      // Modo manual com Zoom e Deslocamento (X, Y)
      const meta = await sharp(inputBuffer).metadata();
      const origW = meta.width || targetW;
      const origH = meta.height || targetH;

      const numZoom = Math.max(1.0, Math.min(Number(zoom) || 1.0, 3.5));
      const numOffX = Math.max(-50, Math.min(Number(offsetX) || 0, 50));
      const numOffY = Math.max(-50, Math.min(Number(offsetY) || 0, 50));

      const scaleBase = Math.max(targetW / origW, targetH / origH);
      const totalScale = scaleBase * numZoom;
      const currentW = origW * totalScale;
      const currentH = origH * totalScale;

      const windowCenterX = currentW / 2 - (numOffX / 100) * targetW;
      const windowCenterY = currentH / 2 - (numOffY / 100) * targetH;

      const left_curr = windowCenterX - targetW / 2;
      const top_curr = windowCenterY - targetH / 2;

      let cropLeft = Math.round(left_curr / totalScale);
      let cropTop = Math.round(top_curr / totalScale);
      let cropWidth = Math.round(targetW / totalScale);
      let cropHeight = Math.round(targetH / totalScale);

      // Limites de segurança
      cropWidth = Math.min(cropWidth, origW);
      cropHeight = Math.min(cropHeight, origH);
      cropLeft = Math.max(0, Math.min(cropLeft, origW - cropWidth));
      cropTop = Math.max(0, Math.min(cropTop, origH - cropHeight));

      outputBuffer = await sharp(inputBuffer)
        .extract({
          left: cropLeft,
          top: cropTop,
          width: cropWidth,
          height: cropHeight,
        })
        .resize(targetW, targetH)
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, outputBuffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Erro ao processar/cortar imagem:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao processar recorte de thumbnail." },
      { status: 500 }
    );
  }
}
