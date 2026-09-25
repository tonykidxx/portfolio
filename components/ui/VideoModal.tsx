"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Play, Pause } from "lucide-react";
import { getVideoEmbed, getYouTubeId, isYouTubeShorts, splitTitleIntoTwoLines } from "@/lib/video-utils";

interface VideoModalProps {
  project: {
    id?: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    isVertical?: boolean;
    category?: { name: string } | null;
  } | null;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function VideoModal({ project, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isDetectedVertical, setIsDetectedVertical] = useState<boolean | null>(null);

  const ytId = project?.videoUrl ? getYouTubeId(project.videoUrl) : null;
  const isShorts = project?.videoUrl ? isYouTubeShorts(project.videoUrl) : false;
  const embed = project ? getVideoEmbed(project.videoUrl) : { type: "direct" as const };
  const isDirectVideo = embed.type === "direct";

  // Fecha no ESC e alterna play/pause com a barra de espaço
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isPlaying]);

  // Reset de estados quando o projeto muda
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setProgressPercent(0);
    setIsDetectedVertical(null);
    ytPlayerRef.current = null;
  }, [project]);

  // Integração com a API do YouTube para controle unificado (Play, Pause, Tempo e Progresso)
  useEffect(() => {
    if (!ytId) return;

    let intervalId: any = null;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      try {
        ytPlayerRef.current = new (window as any).YT.Player("modal-yt-iframe", {
          events: {
            onReady: (event: any) => {
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
              event.target.playVideo();
              setIsPlaying(true);
            },
            onStateChange: (event: any) => {
              // 1: PLAYING, 2: PAUSED, 0: ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                const dur = event.target.getDuration();
                if (dur > 0) setDuration(dur);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
              }
            },
          },
        });
      } catch (err) {
        // Fallback gracioso
      }

      intervalId = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          try {
            const curr = ytPlayerRef.current.getCurrentTime();
            const dur = ytPlayerRef.current.getDuration() || duration;
            if (curr !== undefined && !isSeeking) {
              setCurrentTime(curr);
              if (dur > 0) {
                setDuration(dur);
                setProgressPercent((curr / dur) * 100);
              }
            }
          } catch (e) {}
        }
      }, 250);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      if (!document.getElementById("yt-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initYT();
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [ytId]);

  const togglePlay = useCallback(() => {
    // 1. Caso vídeo direto (HTML5)
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    // 2. Caso vídeo YouTube
    if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === "function") {
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === 1) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
        return;
      } catch (e) {}
    }

    // Fallback via postMessage para o iframe do YouTube
    const iframe = document.getElementById("modal-yt-iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      const func = isPlaying ? "pauseVideo" : "playVideo";
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*"
      );
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeeking) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    if (dur > 0) {
      setProgressPercent((curr / dur) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);

    // Detecção automática se a mídia gravada é vertical (altura > largura)
    if (videoRef.current.videoHeight && videoRef.current.videoWidth) {
      setIsDetectedVertical(videoRef.current.videoHeight > videoRef.current.videoWidth);
    }

    videoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      });
  };

  const seekToPosition = (clientX: number) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    const totalDur = duration || videoRef.current?.duration || 0;

    if (totalDur > 0) {
      const newTime = percent * totalDur;
      setCurrentTime(newTime);
      setProgressPercent(percent * 100);

      // Direto
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }

      // YouTube
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        try {
          ytPlayerRef.current.seekTo(newTime, true);
        } catch (e) {}
      } else {
        const iframe = document.getElementById("modal-yt-iframe") as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            JSON.stringify({ event: "command", func: "seekTo", args: [newTime, true] }),
            "*"
          );
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    seekToPosition(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      seekToPosition(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!project) return null;

  // Determina se o vídeo é vertical (9:16) ou horizontal (16:9)
  const isVert =
    isDetectedVertical !== null
      ? isDetectedVertical
      : isShorts || project.isVertical === true;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container Unificado com Cantos Arredondados e Proporção Adaptável (9:16 vertical ou 16:9 horizontal) */}
      <div
        className={`relative overflow-hidden rounded-2xl shadow-2xl bg-black border border-white/10 transition-all ${
          isVert
            ? "w-full max-w-[min(92vw,calc(86vh*9/16))] aspect-[9/16] max-h-[86vh]"
            : "w-full max-w-[min(94vw,calc(86vh*16/9))] aspect-[16/9] max-h-[86vh]"
        }`}
      >
        {/* Vídeo / Iframe com Overscan Cinematográfico que oculta os controles e logos nativos do YouTube e Vimeo */}
        <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
          {ytId ? (
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none select-none">
              <iframe
                id="modal-yt-iframe"
                src={`https://www.youtube-nocookie.com/embed/${ytId}?enablejsapi=1&autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&showinfo=0&fs=0`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-[126%] h-[126%] max-w-none max-h-none border-0 object-cover pointer-events-none select-none"
              />
            </div>
          ) : embed.type === "vimeo" ? (
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none select-none">
              <iframe
                src={`https://player.vimeo.com/video/${embed.videoId}?autoplay=1&title=0&byline=0&portrait=0`}
                title={project.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-[120%] h-[120%] max-w-none max-h-none border-0 object-cover pointer-events-none select-none"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={project.videoUrl}
              preload="auto"
              autoPlay
              playsInline
              loop
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Camada Transparente de Clique para Alternar Play/Pause */}
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="Alternar reprodução"
        />

        {/* Botão de Fechar no Canto Superior Direito (único botão fixo) */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg backdrop-blur-xs"
          aria-label="Fechar vídeo"
        >
          <X size={20} strokeWidth={2.2} />
        </button>

        {/* Informações do Projeto - Posicionado mais para baixo com quebra em múltiplas linhas e animação suave da esquerda para direita */}
        <div
          className={`absolute top-8 sm:top-12 md:top-16 left-0 p-5 sm:p-8 md:p-10 z-30 pointer-events-none transition-all duration-500 ease-out max-w-[80%] sm:max-w-[70%] md:max-w-[62%] ${
            !isPlaying
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-12"
          }`}
        >
          <h2
            className={`font-bebas text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-[0.92] tracking-[1.5px] m-0 ${
              isVert
                ? "text-3xl sm:text-4xl md:text-5xl"
                : "text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            }`}
          >
            {splitTitleIntoTwoLines(project.title).map((line, idx) => (
              <span key={idx} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>

          <div className="flex flex-col gap-1 mt-2.5">
            {project.category?.name && (
              <p className="text-[#e5e5e5] text-xs sm:text-sm font-semibold tracking-wider uppercase font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {project.category.name}
              </p>
            )}
            {project.description && (
              <p className="text-gray-300 text-xs sm:text-sm font-sans line-clamp-2 max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Camada de Gradiente Cinematográfico no Pause */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/80 pointer-events-none transition-opacity duration-400 z-20 ${
            !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Botão Circular Central de Play/Pause - Estilo do Player de Referência */}
        <div
          className={`absolute inset-0 flex items-center justify-center z-30 transition-all duration-300 ${
            !isPlaying
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/90 bg-black/40 hover:bg-black/60 backdrop-blur-xs flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
            aria-label={isPlaying ? "Pausar" : "Reproduzir"}
          >
            {isPlaying ? (
              <Pause size={30} className="fill-white" />
            ) : (
              <Play size={30} className="fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Indicador de Tempo no Canto Inferior Esquerdo (aparece no pause) */}
        {duration > 0 && (
          <div
            className={`absolute bottom-6 sm:bottom-7 left-4 sm:left-6 z-30 transition-opacity duration-300 pointer-events-none ${
              !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-xs sm:text-sm font-mono text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Barra de Carregamento Vermelha com Marcador Redondo (Referência mantendo a cor vermelha) */}
        <div
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
          className="absolute bottom-0 left-0 right-0 z-30 px-3 sm:px-5 pb-2.5 pt-3 cursor-pointer group/progress"
        >
          <div className="relative w-full h-[3px] sm:h-[4px] bg-white/25 rounded-full overflow-visible transition-all group-hover/progress:h-[5px]">
            {/* Barra preenchida em vermelho */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-[#e50914] rounded-full transition-[width] duration-75"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Marcador Redondo da Referência */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#e50914] rounded-full border-2 border-white shadow-[0_0_10px_rgba(229,9,20,0.95)] transition-transform duration-100 group-hover/progress:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
