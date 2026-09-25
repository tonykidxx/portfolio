import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json({ error: "URL do vídeo é obrigatória" }, { status: 400 });
  }

  try {
    // If it's already a direct video file (e.g., /uploads/ or external .mp4/.webm)
    if (
      videoUrl.startsWith("/uploads/") ||
      videoUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)
    ) {
      return NextResponse.json({
        streamUrl: videoUrl,
        type: "direct",
      });
    }

    // Use yt-dlp to extract stream URL for YouTube, Vimeo, etc.
    const ytDlpPath = path.join(process.cwd(), "bin", "yt-dlp.exe");

    if (!fs.existsSync(ytDlpPath)) {
      return NextResponse.json(
        { error: "Extrator yt-dlp não encontrado" },
        { status: 500 }
      );
    }

    // Extract best mp4 video stream url
    const cmd = `"${ytDlpPath}" --js-runtimes node -f "bestvideo[ext=mp4]/bestvideo/best" -g "${videoUrl}"`;
    const { stdout, stderr } = await execAsync(cmd, { timeout: 20000 });

    const urls = stdout
      .trim()
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0 || !urls[0].startsWith("http")) {
      throw new Error(stderr || "Não foi possível obter o stream do vídeo.");
    }

    const streamUrl = urls[0];

    // Return the proxied URL so browser has 100% same-origin access with no CORS taint
    const proxiedUrl = `/api/video-proxy?url=${encodeURIComponent(streamUrl)}`;

    return NextResponse.json({
      streamUrl: proxiedUrl,
      rawStreamUrl: streamUrl,
      type: "extracted",
    });
  } catch (error: any) {
    console.error("Erro ao extrair stream de vídeo:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao extrair stream do vídeo" },
      { status: 500 }
    );
  }
}
