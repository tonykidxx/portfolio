"use client";

import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { VideoModal } from "./VideoModal";
import { getYouTubeId, getVimeoId, getHighResThumbnail, splitTitleIntoTwoLines } from "@/lib/video-utils";

interface HeroProps {
  heroProject?: {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    thumbUrl?: string | null;
    isVertical?: boolean;
    category?: { name: string } | null;
  } | null;
  siteSettings?: {
    siteName?: string;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
  } | null;
  onPlayVideo?: (project: any) => void;
}

export function Hero({ heroProject, siteSettings, onPlayVideo }: HeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onPlayVideo && heroProject) {
      onPlayVideo(heroProject);
    } else if (heroProject) {
      setIsPlaying(true);
    }
  };

  const title = heroProject?.title || siteSettings?.heroTitle || "CANDY MACHINE STUDIOS";
  const titleLines = splitTitleIntoTwoLines(title);
  const categoryName = heroProject?.category?.name || "Comerciais";

  // Thumbnail em altíssima definição (Full HD 1080p maxresdefault) como pôster de fundo
  const initialBg = getHighResThumbnail(heroProject?.thumbUrl, heroProject?.videoUrl);
  const [bgImage, setBgImage] = useState<string>(initialBg);

  useEffect(() => {
    setBgImage(getHighResThumbnail(heroProject?.thumbUrl, heroProject?.videoUrl));
  }, [heroProject?.thumbUrl, heroProject?.videoUrl]);

  // Fallback seguro caso o vídeo não tenha versão 1080p no YouTube
  const handleBgError = () => {
    const ytId = heroProject?.videoUrl ? getYouTubeId(heroProject.videoUrl) : null;
    if (ytId && bgImage.includes("maxresdefault.jpg")) {
      setBgImage(`https://img.youtube.com/vi/${ytId}/hq720.jpg`);
    } else if (ytId && bgImage.includes("hq720.jpg")) {
      setBgImage(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
    }
  };

  const isVertical = heroProject?.isVertical;
  const ytId = heroProject?.videoUrl ? getYouTubeId(heroProject.videoUrl) : null;
  const vimeoId = heroProject?.videoUrl ? getVimeoId(heroProject.videoUrl) : null;
  const isDirectVideo = heroProject?.videoUrl && !ytId && !vimeoId;

  // O YouTube não permite ocultar o título nativamente.
  // TRUQUE DEFINITIVO: Em vez de dar "zoom" (scale) e cortar as laterais do vídeo, 
  // nós aumentamos a ALTURA do iframe do YouTube em 300px.
  // Isso força o player a adicionar faixas pretas em cima e embaixo para manter a proporção do vídeo.
  // O título fica preso na faixa preta superior. Como o iframe está centralizado, a faixa preta e o título
  // ficam completamente escondidos fora do container (overflow-hidden), mostrando apenas o vídeo perfeito!
  
  const wrapperClass = isVertical
    ? (ytId 
        ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,34svh)] h-[calc(max(60svh,177.77vw)_+_300px)] sm:w-[max(100vw,45vh)] sm:h-[calc(max(80vh,177.77vw)_+_300px)] scale-[1.05] pointer-events-none border-0 filter brightness-[0.80] contrast-[1.05]"
        : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,34svh)] h-[max(60svh,177.77vw)] sm:w-[max(100vw,45vh)] sm:h-[max(80vh,177.77vw)] scale-[1.05] pointer-events-none border-0 filter brightness-[0.80] contrast-[1.05]")
    : (ytId
        ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,107svh)] h-[calc(max(60svh,56.25vw)_+_300px)] sm:w-[max(100vw,142.22vh)] sm:h-[calc(max(80vh,56.25vw)_+_300px)] scale-[1.05] pointer-events-none border-0 filter brightness-[0.80] contrast-[1.05]"
        : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[max(100vw,107svh)] h-[max(60svh,56.25vw)] sm:w-[max(100vw,142.22vh)] sm:h-[max(80vh,56.25vw)] scale-[1.05] pointer-events-none border-0 filter brightness-[0.80] contrast-[1.05]");

  const mediaClass = "absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.05]";

  // Gerenciamento do player de fundo via YouTube API para loop contínuo sem corte e sem ícones de playlist (|<< || >>|)
  useEffect(() => {
    if (!ytId) return;

    let player: any = null;
    let loopInterval: any = null;

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return false;

      player = new (window as any).YT.Player("hero-yt-bg-player", {
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (e: any) => {
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // Reinicia imediatamente ao terminar sem tela de fim
            if (e.data === 0) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
        },
      });

      // Loop perfeito contínuo sem pausa para recarregar
      loopInterval = setInterval(() => {
        try {
          if (
            player &&
            typeof player.getCurrentTime === "function" &&
            typeof player.getDuration === "function"
          ) {
            const cur = player.getCurrentTime();
            const dur = player.getDuration();
            if (dur > 0 && cur >= dur - 0.3) {
              player.seekTo(0, true);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 200);

      return true;
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    const handleVisibility = () => {
      if (!document.hidden && player && typeof player.playVideo === "function") {
        player.playVideo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (loopInterval) clearInterval(loopInterval);
      try {
        if (player && typeof player.destroy === "function") {
          player.destroy();
        }
      } catch (e) {
        // ignore
      }
    };
  }, [ytId]);

  return (
    <section className="relative min-h-[60vh] sm:min-h-[80vh] flex items-end pb-20 sm:pb-24 px-[4%] bg-[#141414] overflow-hidden">
      {/* Background Video / Image Container com reprodução contínua em loop ao fundo sem som e SEM controles/ícone de pause */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pôster de alta definição (renderizado enquanto o vídeo carrega) */}
        <img
          src={bgImage}
          alt={title}
          onError={handleBgError}
          fetchPriority="high"
          loading="eager"
          className={mediaClass}
        />

        {/* Vídeo do Hero em loop sem som contínuo - Sem playlist e sem controles de centro */}
        {ytId ? (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
            <div
              id="hero-yt-bg-player"
              className={wrapperClass}
            />
          </div>
        ) : vimeoId ? (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
              className={wrapperClass}
              allow="autoplay; fullscreen"
            />
          </div>
        ) : isDirectVideo ? (
          <video
            src={heroProject?.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.80] contrast-[1.05] pointer-events-none"
          />
        ) : null}

        {/* Gradientes cinematográficos para garantir legibilidade dos textos e botões */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/95 via-[#141414]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent pointer-events-none" />
        {/* Fade extra forte na metade inferior para suavizar o corte do vídeo no mobile */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#141414] via-[#141414]/95 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl space-y-3">
        <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.92] tracking-[1px] text-white uppercase drop-shadow-md m-0">
          {titleLines.map((line, idx) => (
            <span key={idx} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h1>

        <p className="text-base sm:text-lg text-[#e5e5e5] font-medium tracking-normal font-sans">
          {categoryName}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {heroProject && (
            <button
              type="button"
              onClick={handlePlay}
              className="flex items-center gap-2 bg-white text-black font-bold px-7 py-3.5 rounded-[6px] text-base hover:bg-white/85 transition-all shadow-xl hover:scale-102 active:scale-95 cursor-pointer font-sans"
            >
              <Play fill="black" size={18} />
              <span>Assistir</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de contingência caso o Hero seja usado sem o HomeView global */}
      {!onPlayVideo && isPlaying && heroProject && (
        <VideoModal
          project={heroProject}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </section>
  );
}
