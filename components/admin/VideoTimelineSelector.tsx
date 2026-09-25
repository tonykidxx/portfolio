"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Film,
  Play,
  Pause,
  Camera,
  Check,
  Loader2,
  Upload,
  Image as ImageIcon,
  Crop,
  Clock,
  Info,
  Sliders,
  FileVideo,
  AlertTriangle,
} from "lucide-react";
import { getYouTubeThumbnail, getRandomYouTubeFrame } from "@/lib/video-utils";

interface VideoTimelineSelectorProps {
  videoUrl: string;
  currentThumbUrl: string;
  isVertical: boolean;
  onSelectThumbnail: (url: string) => void;
  onOpenAdjuster?: () => void;
}

export function VideoTimelineSelector({
  videoUrl,
  currentThumbUrl,
  isVertical,
  onSelectThumbnail,
  onOpenAdjuster,
}: VideoTimelineSelectorProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "upload">("timeline");

  // Video element and playback state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  const [resolvedStreamUrl, setResolvedStreamUrl] = useState<string>("");
  const [loadingStream, setLoadingStream] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string>("");

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Upload tab state
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>("");

  const showStatus = (text: string, type: "success" | "error" | "info" = "success") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Format seconds to mm:ss.ms
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00.0";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // Resolve video stream URL (from YouTube, direct URL or local upload)
  useEffect(() => {
    let isCancelled = false;

    if (!videoUrl || videoUrl.trim() === "") {
      setResolvedStreamUrl("");
      setStreamError("");
      setLoadingStream(false);
      return;
    }

    // Direct video file or uploaded video
    if (
      videoUrl.startsWith("blob:") ||
      videoUrl.startsWith("/uploads/") ||
      videoUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i)
    ) {
      setResolvedStreamUrl(videoUrl);
      setStreamError("");
      setLoadingStream(false);
      return;
    }

    // YouTube / External Video -> Fetch through video-stream API
    setLoadingStream(true);
    setStreamError("");

    fetch(`/api/video-stream?url=${encodeURIComponent(videoUrl.trim())}`)
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar o stream do vídeo.");
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
        if (data.streamUrl) {
          setResolvedStreamUrl(data.streamUrl);
        } else {
          throw new Error(data.error || "Stream não disponível.");
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn("Video stream resolution warning:", err);
        setStreamError(
          "Não foi possível extrair o stream deste link automaticamente. Você pode carregar o arquivo de vídeo do seu computador para navegar na timeline."
        );
      })
      .finally(() => {
        if (!isCancelled) setLoadingStream(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [videoUrl]);

  // Video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (!isNaN(dur) && dur > 0) {
        setDuration(dur);
        const initial = Math.min(1, dur * 0.1);
        videoRef.current.currentTime = initial;
        setCurrentTime(initial);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Step backward / forward
  const stepTime = (delta: number) => {
    if (!videoRef.current || duration === 0) return;
    const target = Math.max(0, Math.min(duration, currentTime + delta));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Mouse / Touch scrubbing on timeline track
  const handleTimelineScrub = useCallback(
    (clientX: number) => {
      if (!timelineTrackRef.current || duration === 0 || !videoRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetTime = progress * duration;

      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    },
    [duration]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    if (isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    handleTimelineScrub(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) handleTimelineScrub(e.clientX);
    };
    const handleMouseUp = () => {
      if (isScrubbing) setIsScrubbing(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrubbing && e.touches[0]) {
        handleTimelineScrub(e.touches[0].clientX);
      }
    };
    const handleTouchEnd = () => {
      if (isScrubbing) setIsScrubbing(false);
    };

    if (isScrubbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isScrubbing, handleTimelineScrub]);

  // Capture frame from <video> via Canvas and upload as permanent image
  const captureCurrentFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    setCapturing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Contexto 2D não suportado pelo navegador.");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );

      if (!blob) throw new Error("Erro ao gerar arquivo de imagem.");

      // Upload to /api/upload
      const file = new File([blob], `frame-${Date.now()}.jpg`, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        onSelectThumbnail(dataUrl);
        showStatus("Frame capturado como thumbnail!", "success");
        return;
      }

      const data = await res.json();
      onSelectThumbnail(data.url);
      showStatus("✓ Frame capturado com sucesso e salvo em alta definição!", "success");
    } catch (err: any) {
      console.error("Frame capture error:", err);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        onSelectThumbnail(dataUrl);
        showStatus("✓ Frame capturado!", "success");
      } catch (fallbackErr) {
        showStatus("Erro ao capturar o frame deste vídeo.", "error");
      }
    } finally {
      setCapturing(false);
    }
  };

  // Handle local video file loaded directly into player
  const handleLocalVideoFile = (file: File) => {
    try {
      const blobUrl = URL.createObjectURL(file);
      setResolvedStreamUrl(blobUrl);
      setStreamError("");
      showStatus("Arquivo de vídeo carregado na timeline com sucesso!", "info");
    } catch (e) {
      showStatus("Erro ao abrir arquivo de vídeo local.", "error");
    }
  };

  // Handle direct file upload for thumbnail
  const handleUploadImageFile = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload.");
      const data = await res.json();
      onSelectThumbnail(data.url);
      showStatus("✓ Capa enviada com sucesso!", "success");
    } catch (err: any) {
      showStatus(err.message || "Erro ao enviar imagem.", "error");
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Camera size={16} className="text-[#e50914]" />
            <span>Seleção de Thumbnail / Capa</span>
          </label>
        </div>

        {/* Abas de Navegação */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-lg border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "timeline"
                ? "bg-[#e50914] text-white shadow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film size={13} />
            <span>Timeline do Vídeo (Todos os Frames)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#e50914] text-white shadow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Upload size={13} />
            <span>Upload de Imagem / URL</span>
          </button>
        </div>
      </div>

      {/* Notificação de Status */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all animate-fadeIn ${
            statusMsg.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
              : statusMsg.type === "error"
              ? "bg-red-950/60 border-red-500/40 text-red-300"
              : "bg-blue-950/60 border-blue-500/40 text-blue-300"
          }`}
        >
          {statusMsg.type === "success" ? <Check size={14} /> : <Info size={14} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* CONTEÚDO DA ABA 1: TIMELINE CONTÍNUA DE TODOS OS FRAMES */}
      {activeTab === "timeline" && (
        <div className="bg-[#181818] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
          {!videoUrl && !resolvedStreamUrl ? (
            <div className="p-8 text-center space-y-3 bg-black/40 rounded-xl border border-white/5">
              <Film size={32} className="mx-auto text-gray-500" />
              <p className="text-sm font-semibold text-gray-300">
                Nenhum vídeo anexado no momento.
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Insira o link ou faça o upload de um vídeo no campo acima para carregar a timeline completa e navegar por todos os frames.
              </p>
            </div>
          ) : loadingStream ? (
            <div className="p-12 text-center space-y-3 bg-black/40 rounded-xl border border-white/5">
              <Loader2 size={32} className="mx-auto text-[#e50914] animate-spin" />
              <p className="text-sm font-semibold text-white">
                Carregando timeline do vídeo...
              </p>
              <p className="text-xs text-gray-400">
                Conectando ao stream do vídeo para permitir a navegação frame a frame.
              </p>
            </div>
          ) : streamError ? (
            <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Carregamento Direto da Timeline</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {streamError}
              </p>
              <div className="pt-2">
                <label className="px-4 py-2 bg-[#e50914] hover:bg-[#f6121d] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow">
                  <FileVideo size={14} />
                  <span>Selecionar arquivo de vídeo do computador (.mp4/.mov)</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLocalVideoFile(f);
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            /* TIMELINE CONTÍNUA COM O VÍDEO COMPLETO */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-[#e50914]" />
                    <span>Navegador de Frames do Vídeo</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Arraste a barra para navegar por todos os quadros do vídeo e clique em &quot;Capturar este Frame&quot;:
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 shrink-0">
                    <Clock size={13} className="text-[#e50914]" />
                    <span>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Opção rápida de carregar arquivo local para navegação ultrarrápida */}
                  <label
                    className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer border border-white/10 transition-colors shrink-0"
                    title="Carregar arquivo do PC para navegação offline imediata"
                  >
                    <FileVideo size={13} className="text-[#e50914]" />
                    <span className="hidden sm:inline">Trocar Fonte por Arquivo Local</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleLocalVideoFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Player do Vídeo com Controles de Captura */}
              <div className="relative aspect-[16/9] max-h-[400px] bg-black rounded-xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={resolvedStreamUrl}
                  crossOrigin="anonymous"
                  preload="metadata"
                  playsInline
                  muted
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                />

                {/* Overlay Play / Pause central ao clicar */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/35 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                  </div>
                </button>
              </div>

              {/* BARRA DA TIMELINE 100% CONTÍNUA */}
              <div className="space-y-3 pt-1">
                {/* Track visual interativa para arraste com mouse / toque */}
                <div
                  ref={timelineTrackRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={(e) => {
                    setIsScrubbing(true);
                    if (isPlaying && videoRef.current) {
                      videoRef.current.pause();
                      setIsPlaying(false);
                    }
                    if (e.touches[0]) handleTimelineScrub(e.touches[0].clientX);
                  }}
                  className="relative h-7 bg-[#222] rounded-lg border border-white/10 cursor-pointer overflow-hidden group select-none flex items-center shadow-inner"
                >
                  {/* Progresso decorrido em vermelho vivo */}
                  <div
                    className="h-full bg-gradient-to-r from-red-800 to-[#e50914] transition-all"
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />

                  {/* Agulha / Cabeça de reprodução arrastável */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white shadow-xl shadow-black ring-2 ring-[#e50914] rounded-xs"
                    style={{
                      left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 5px)`,
                    }}
                  />

                  {/* Tooltip flutuante de tempo */}
                  <div
                    className="absolute top-1 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-2 py-0.5 rounded text-[11px] font-mono text-white border border-white/20 shadow-md"
                    style={{
                      left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    {formatTime(currentTime)}
                  </div>
                </div>

                {/* Range Slider nativo de alta precisão (arraste contínuo por todos os frames) */}
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.01}
                    value={currentTime}
                    disabled={duration === 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentTime(val);
                      if (videoRef.current) {
                        videoRef.current.currentTime = val;
                      }
                    }}
                    className="w-full h-2.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e50914] disabled:opacity-40"
                  />
                </div>

                {/* Controles de Navegação Fina & Botão Principal de Captura */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {/* Botões de Precisão Frame a Frame */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 bg-[#252525] hover:bg-[#333] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-white/10"
                      title={isPlaying ? "Pausar" : "Reproduzir"}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => stepTime(-1)}
                      className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer border border-white/10"
                      title="Voltar 1 segundo"
                    >
                      -1.0s
                    </button>

                    <button
                      type="button"
                      onClick={() => stepTime(-0.1)}
                      className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer border border-white/10"
                      title="Quadro anterior (-0.1s)"
                    >
                      -0.1s
                    </button>

                    <button
                      type="button"
                      onClick={() => stepTime(0.1)}
                      className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer border border-white/10"
                      title="Próximo quadro (+0.1s)"
                    >
                      +0.1s
                    </button>

                    <button
                      type="button"
                      onClick={() => stepTime(1)}
                      className="px-2.5 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg text-xs font-mono transition-colors cursor-pointer border border-white/10"
                      title="Avançar 1 segundo"
                    >
                      +1.0s
                    </button>
                  </div>

                  {/* BOTÃO PRINCIPAL DE CAPTURA DO FRAME ESCOLHIDO */}
                  <button
                    type="button"
                    disabled={capturing || duration === 0}
                    onClick={captureCurrentFrame}
                    className="px-6 py-2.5 bg-[#e50914] hover:bg-[#f6121d] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
                  >
                    {capturing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Extraindo Frame do Vídeo...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        <span>Capturar este Frame como Thumbnail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 2: UPLOAD DE IMAGEM / URL */}
      {activeTab === "upload" && (
        <div className="bg-[#181818] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload size={16} className="text-[#e50914]" />
              <span>Enviar Imagem Própria ou Colar Link</span>
            </h4>
            <p className="text-xs text-gray-400">
              Faça upload de uma foto do seu computador (JPG, PNG, WebP) ou insira a URL direta da imagem:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Box de Upload por Arquivo */}
            <label className="border-2 border-dashed border-white/20 hover:border-[#e50914] rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all bg-black/30 hover:bg-black/50 group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 group-hover:text-[#e50914] transition-colors">
                {uploadingFile ? (
                  <Loader2 size={24} className="animate-spin text-[#e50914]" />
                ) : (
                  <ImageIcon size={24} />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-white group-hover:text-[#e50914] transition-colors">
                  Clique para Escolher Imagem
                </span>
                <p className="text-[11px] text-gray-500">
                  Ou arraste o arquivo aqui (JPG, PNG, WebP)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingFile}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadImageFile(f);
                }}
              />
            </label>

            {/* Box de URL Manual */}
            <div className="bg-black/30 border border-white/10 rounded-xl p-5 flex flex-col justify-center space-y-3">
              <label className="text-xs font-bold text-gray-200">
                URL Direta da Capa:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://exemplo.com/minha-capa.jpg"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="flex-1 bg-[#222] border border-[#444] focus:border-[#e50914] rounded-lg px-3 py-2 text-white text-xs"
                />
                <button
                  type="button"
                  disabled={!manualUrl.trim()}
                  onClick={() => {
                    onSelectThumbnail(manualUrl.trim());
                    setManualUrl("");
                    showStatus("URL da thumbnail aplicada!", "success");
                  }}
                  className="px-3 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRÉVIA DA CAPA ATIVA & BOTÃO DE AJUSTAR / REMOVER TARJAS PRETAS */}
      {(() => {
        const effectiveThumb =
          currentThumbUrl ||
          (videoUrl ? getYouTubeThumbnail(videoUrl) || getRandomYouTubeFrame(videoUrl) : "");

        return (
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {effectiveThumb ? (
                <div
                  className={`relative overflow-hidden rounded-lg border border-white/15 bg-black shrink-0 ${
                    isVertical ? "w-16 aspect-[9/16]" : "w-28 aspect-[16/9]"
                  }`}
                >
                  <img
                    src={effectiveThumb}
                    alt="Thumbnail Atual"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-gray-500 shrink-0 ${
                    isVertical ? "w-16 aspect-[9/16]" : "w-28 aspect-[16/9]"
                  }`}
                >
                  <ImageIcon size={20} />
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {currentThumbUrl ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      Capa Selecionada
                    </>
                  ) : (
                    <>
                      <Film size={13} className="text-amber-400" />
                      Capa Padrão Ativa
                    </>
                  )}
                </span>
                <p className="text-[11px] text-gray-400 max-w-sm truncate">
                  {currentThumbUrl || "Nenhuma capa manual fixada (usando capa padrão do vídeo)."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentThumbUrl && (
                <button
                  type="button"
                  onClick={() => onSelectThumbnail("")}
                  className="px-3 py-2 text-xs text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  Limpar Capa
                </button>
              )}

              {effectiveThumb && onOpenAdjuster && (
                <button
                  type="button"
                  onClick={onOpenAdjuster}
                  className="px-3.5 py-2 bg-[#e50914]/20 hover:bg-[#e50914]/30 text-red-200 border border-[#e50914]/40 hover:border-[#e50914] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Crop size={14} className="text-[#e50914]" />
                  <span>Ajustar & Remover Tarjas Pretas</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
