/**
 * Utilitários para detecção e reprodução de vídeos (YouTube, Vimeo e Diretos)
 */

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleaned = url.trim();

  // youtube.com/watch?v=ID ou m.youtube.com/watch?v=ID
  const watchMatch = cleaned.match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return null;
}

export function isYouTubeShorts(url: string): boolean {
  if (!url) return false;
  return url.includes("/shorts/");
}

export function getVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  return match && match[1] ? match[1] : null;
}

export interface VideoEmbedInfo {
  type: "youtube" | "vimeo" | "direct";
  embedUrl?: string;
  videoId?: string;
}

export function getVideoEmbed(url: string): VideoEmbedInfo {
  if (!url) return { type: "direct" };

  const ytId = getYouTubeId(url);
  if (ytId) {
    return {
      type: "youtube",
      videoId: ytId,
      // youtube-nocookie com parâmetros otimizados para reprodução cinematográfica de vídeos não-listados
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`,
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      type: "vimeo",
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
    };
  }

  return {
    type: "direct",
    embedUrl: url,
  };
}

export function getYouTubeThumbnail(url: string): string | null {
  const ytId = getYouTubeId(url);
  if (!ytId) return null;
  // Retorna maxresdefault (alta resolução 1080p) do YouTube
  return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
}

export function getHighResThumbnail(urlOrThumb?: string | null, videoUrl?: string | null): string {
  const ytId = (videoUrl ? getYouTubeId(videoUrl) : null) || (urlOrThumb ? getYouTubeId(urlOrThumb) : null) || (urlOrThumb ? urlOrThumb.match(/vi\/([a-zA-Z0-9_-]{11})/)?.[1] : null);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  if (urlOrThumb) {
    return urlOrThumb.replace(/\/(?:hqdefault|sddefault|[123])\.jpg/, "/maxresdefault.jpg");
  }
  return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&auto=format&fit=crop&q=90";
}

export function upgradeYouTubeThumbToHighRes(url?: string | null): string | null {
  if (!url) return null;
  // Substitui qualquer versão de baixa resolução do YouTube (1.jpg, 2.jpg, 3.jpg, mqdefault) pela versão Full HD maxresdefault
  if (url.includes("img.youtube.com/vi/")) {
    return url.replace(/\/(?:hqdefault|sddefault|mqdefault|[123])\.jpg(\?.*)?$/, "/maxresdefault.jpg$1");
  }
  return url;
}

/**
 * Retorna os quadros (frames) capturados diretamente do próprio vídeo do YouTube em alta definição.
 */
export interface YouTubeFrameOption {
  label: string;
  url: string;
  description: string;
}

export function getYouTubeFrames(url: string): YouTubeFrameOption[] {
  const ytId = getYouTubeId(url);
  if (!ytId) return [];

  return [
    {
      label: "Capa Principal (Full HD - 1080p)",
      url: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      description: "Quadro principal em resolução máxima (Full HD 1080p)",
    },
    {
      label: "Quadro 1 (Início - HQ)",
      url: `https://img.youtube.com/vi/${ytId}/hq1.jpg`,
      description: "Capturado a ~25% do tempo do vídeo em Alta Resolução",
    },
    {
      label: "Quadro 2 (Meio - HQ)",
      url: `https://img.youtube.com/vi/${ytId}/hq2.jpg`,
      description: "Capturado a ~50% do tempo do vídeo em Alta Resolução",
    },
    {
      label: "Quadro 3 (Final - HQ)",
      url: `https://img.youtube.com/vi/${ytId}/hq3.jpg`,
      description: "Capturado a ~75% do tempo do vídeo em Alta Resolução",
    },
  ];
}

/**
 * Retorna uma miniatura em alta definição extraída do próprio vídeo do YouTube.
 */
export function getRandomYouTubeFrame(url: string, seed?: string): string | null {
  const ytId = getYouTubeId(url);
  if (!ytId) return null;
  // Prioriza sempre a capa Full HD de 1080p para máxima qualidade
  return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
}

/**
 * Captura um quadro em tempo real do arquivo de vídeo anexado via HTML5 Canvas.
 */
export function captureVideoFrame(
  videoSource: string | File,
  timestamp?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Captura disponível apenas no navegador"));
    }

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const srcUrl = typeof videoSource === "string" ? videoSource : URL.createObjectURL(videoSource);
    video.src = srcUrl;

    const cleanup = () => {
      if (typeof videoSource !== "string") {
        URL.revokeObjectURL(srcUrl);
      }
    };

    video.onloadedmetadata = () => {
      const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : 10;
      let targetTime = timestamp !== undefined ? timestamp : Math.max(0.5, Math.random() * (dur - 0.5));
      if (targetTime > dur) targetTime = Math.max(0.5, dur / 2);
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          cleanup();
          resolve(dataUrl);
        } else {
          cleanup();
          reject(new Error("Contexto 2D não disponível"));
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}

/**
 * Retorna a miniatura do PRÓPRIO vídeo anexado:
 * 1. thumbUrl cadastrada manualmente (se houver)
 * 2. Quadro real extraído do próprio vídeo do YouTube anexado (1.jpg, 2.jpg, 3.jpg, hqdefault)
 * 3. null se for vídeo direto (deve renderizar o próprio elemento video com #t=1)
 */
export function getVideoOwnThumbnail(project: {
  id?: string;
  title?: string;
  thumbUrl?: string | null;
  videoUrl?: string;
}): string | null {
  if (project.thumbUrl && project.thumbUrl.trim() !== "") {
    return project.thumbUrl;
  }

  if (project.videoUrl) {
    const frame = getRandomYouTubeFrame(project.videoUrl, project.id || project.title);
    if (frame) return frame;
  }

  return null;
}

// Mantido para compatibilidade retroativa
export const getEffectiveThumbnail = (project: any) => {
  return getVideoOwnThumbnail(project) || (project.videoUrl ? getYouTubeThumbnail(project.videoUrl) : "") || "";
};

export const getRandomThumbnail = (seedOrId?: string, isVertical?: boolean) => {
  return "";
};

/**
 * Divide um título em duas linhas equilibradas quando tiver mais de uma palavra.
 * Regra: letras/símbolos isolados (ex: '&', 'a', 'o') e palavras de junção
 * em português e inglês (ex: 'de', 'da', 'the', 'to', 'for', 'em', 'com', etc.)
 * NUNCA ficam soltos no fim da 1ª linha; sempre acompanham a próxima palavra na 2ª linha.
 */
export function splitTitleIntoTwoLines(title: string): string[] {
  if (!title) return [""];
  const cleanTitle = title.trim();
  const words = cleanTitle.split(/\s+/);

  if (words.length <= 1) {
    return [cleanTitle];
  }

  const JOIN_WORDS = new Set([
    "&", "e", "a", "o", "as", "os", "y", "u",
    "de", "da", "do", "das", "dos",
    "em", "na", "no", "nas", "nos",
    "com", "por", "para", "pra", "pro",
    "the", "to", "for", "and", "of", "in", "on", "at", "with", "by", "from",
    "-", "–", "—"
  ]);

  const isJoinWord = (w: string) => {
    if (!w) return false;
    const normalized = w.toLowerCase().replace(/^[^\w&]+|[^\w&]+$/g, "");
    return JOIN_WORDS.has(normalized) || normalized.length <= 1;
  };

  // Se houver um separador explícito como ' - ' ou ' – '
  if (cleanTitle.includes(" - ") || cleanTitle.includes(" – ")) {
    const sep = cleanTitle.includes(" – ") ? " – " : " - ";
    const parts = cleanTitle.split(sep);
    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
      return [parts[0].trim(), `- ${parts[1].trim()}`];
    }
  }

  // Se tiver exatamente 2 palavras: linha 1 = palavra 1, linha 2 = palavra 2
  if (words.length === 2) {
    return [words[0], words[1]];
  }

  // Se tiver 3 palavras:
  // Ex: "Mariano & Jakelyne" -> "Mariano" / "& Jakelyne"
  // Ex: "Óh Quem Fala" -> "Óh" / "Quem Fala"
  // Ex: "Bis Sigma 2026" -> "Bis" / "Sigma 2026"
  // Ex: "Sartori Barber Shop" -> "Sartori" / "Barber Shop"
  // Ex: "Fazenda Santa Lúcia" -> "Fazenda" / "Santa Lúcia"
  if (words.length === 3) {
    return [words[0], `${words[1]} ${words[2]}`];
  }

  // Para 4 ou mais palavras:
  // Encontra o ponto de divisão ideal evitando deixar palavra de junção no fim da linha 1
  let bestSplit = 1;
  let minDiff = Infinity;

  for (let i = 1; i < words.length; i++) {
    // Se a última palavra da linha 1 seria palavra de junção, pula (vai para a linha 2)
    if (isJoinWord(words[i - 1])) {
      continue;
    }

    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const diff = Math.abs(line1.length - line2.length);

    if (diff < minDiff) {
      minDiff = diff;
      bestSplit = i;
    }
  }

  if (bestSplit < 1 || bestSplit >= words.length) {
    bestSplit = Math.ceil(words.length / 2);
  }

  return [
    words.slice(0, bestSplit).join(" "),
    words.slice(bestSplit).join(" "),
  ];
}

