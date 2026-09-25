import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new Response("URL do vídeo não fornecida.", { status: 400 });
  }

  try {
    const range = request.headers.get("range");
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (range) {
      fetchHeaders["Range"] = range;
    }

    const upstreamResponse = await fetch(targetUrl, {
      headers: fetchHeaders,
    });

    const responseHeaders = new Headers();
    responseHeaders.set(
      "Content-Type",
      upstreamResponse.headers.get("Content-Type") || "video/mp4"
    );
    responseHeaders.set("Accept-Ranges", "bytes");

    if (upstreamResponse.headers.get("Content-Range")) {
      responseHeaders.set(
        "Content-Range",
        upstreamResponse.headers.get("Content-Range")!
      );
    }
    if (upstreamResponse.headers.get("Content-Length")) {
      responseHeaders.set(
        "Content-Length",
        upstreamResponse.headers.get("Content-Length")!
      );
    }

    // CORS headers for Canvas capture
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Erro no video-proxy:", error);
    return new Response(
      "Erro ao conectar com o stream de vídeo: " + error.message,
      { status: 502 }
    );
  }
}
