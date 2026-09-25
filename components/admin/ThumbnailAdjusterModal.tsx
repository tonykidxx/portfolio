"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Crop,
  Move,
  Monitor,
  Smartphone,
  Eye,
  Sliders,
} from "lucide-react";
import { splitTitleIntoTwoLines } from "@/lib/video-utils";

interface ThumbnailAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  projectTitle?: string;
  isVertical?: boolean;
  onSave: (newUrl: string) => Promise<void> | void;
}

export function ThumbnailAdjusterModal({
  isOpen,
  onClose,
  imageUrl,
  projectTitle = "Título do Projeto",
  isVertical: initialVertical = false,
  onSave,
}: ThumbnailAdjusterModalProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [offsetX, setOffsetX] = useState<number>(0); // percentagem -50 a 50
  const [offsetY, setOffsetY] = useState<number>(0); // percentagem -50 a 50
  const [isVertical, setIsVertical] = useState<boolean>(initialVertical);
  const [showTitlePreview, setShowTitlePreview] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [autoDetecting, setAutoDetecting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Arraste com o mouse na área da imagem
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initOffX: number; initOffY: number }>({
    startX: 0,
    startY: 0,
    initOffX: 0,
    initOffY: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setIsVertical(initialVertical);
      setZoom(1.0);
      setOffsetX(0);
      setOffsetY(0);
      setStatusMessage("");
    }
  }, [isOpen, initialVertical, imageUrl]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffX: offsetX,
      initOffY: offsetY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      // Sensibilidade proporcional ao zoom
      const sensitivity = 0.2 / zoom;
      const newOffX = Math.max(-50, Math.min(50, dragStartRef.current.initOffX + deltaX * sensitivity));
      const newOffY = Math.max(-50, Math.min(50, dragStartRef.current.initOffY + deltaY * sensitivity));

      setOffsetX(Number(newOffX.toFixed(1)));
      setOffsetY(Number(newOffY.toFixed(1)));
    },
    [isDragging, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  const titleLines = splitTitleIntoTwoLines(projectTitle);

  // Ação de Corte Automático via backend Sharp
  const handleAutoTrim = async () => {
    if (!imageUrl) return;
    setAutoDetecting(true);
    setStatusMessage("Analisando tarjas pretas...");
    try {
      const res = await fetch("/api/crop-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          mode: "auto-trim",
          isVertical,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao detectar tarjas");
      }

      const data = await res.json();
      if (data.url) {
        setStatusMessage("Tarjas removidas com sucesso!");
        await onSave(data.url);
        onClose();
      }
    } catch (err: any) {
      alert(err.message || "Não foi possível remover automaticamente as tarjas.");
      setStatusMessage("");
    } finally {
      setAutoDetecting(false);
    }
  };

  // Salvar o ajuste manual (zoom + offset) via backend Sharp
  const handleSaveManual = async () => {
    if (!imageUrl) return;
    setSaving(true);
    setStatusMessage("Gerando capa ajustada...");
    try {
      const res = await fetch("/api/crop-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          mode: "manual",
          zoom,
          offsetX,
          offsetY,
          isVertical,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao salvar recorte");
      }

      const data = await res.json();
      if (data.url) {
        await onSave(data.url);
        onClose();
      }
    } catch (err: any) {
      alert(err.message || "Erro ao salvar a thumbnail ajustada.");
      setStatusMessage("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161616] border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1c1c1c]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e50914]/20 border border-[#e50914]/30 rounded-lg text-[#e50914]">
              <Crop size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ajuste de Thumbnail & Tarjas Pretas
              </h2>
              <p className="text-xs text-gray-400">
                Ajuste o zoom e o enquadramento para preencher o quadro completamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Coluna Visual: Prévia do Card em Tempo Real */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-black/60 p-4 sm:p-6 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between w-full text-xs text-gray-400 pb-1">
              <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                <Eye size={14} className="text-[#e50914]" />
                Prévia do Card no Site:
              </span>

              {/* Seletor de Formato */}
              <div className="flex items-center gap-1 bg-[#222] p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsVertical(false)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    !isVertical ? "bg-[#e50914] text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Monitor size={12} />
                  <span>16:9</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVertical(true)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    isVertical ? "bg-[#e50914] text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Smartphone size={12} />
                  <span>9:16</span>
                </button>
              </div>
            </div>

            {/* Container do Card com Aspect Ratio Real */}
            <div
              className={`relative overflow-hidden rounded-[4px] bg-[#2a2a2a] shadow-2xl border border-white/20 select-none group cursor-move ${
                isVertical
                  ? "w-[200px] sm:w-[220px] aspect-[9/16]"
                  : "w-full max-w-[420px] aspect-[16/9]"
              }`}
              onMouseDown={handleMouseDown}
              title="Clique e arraste para reposicionar a imagem"
            >
              {/* Imagem com Transform em Tempo Real */}
              <div
                className="w-full h-full will-change-transform flex items-center justify-center"
                style={{
                  transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
              >
                <img
                  src={imageUrl}
                  alt={projectTitle}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>

              {/* Overlay do Título (Exatamente como aparece no site) */}
              {showTitlePreview && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 pointer-events-none">
                  <div className="font-sans font-bold text-sm sm:text-base leading-[1.12] text-white tracking-[0.2px] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {titleLines.map((line, idx) => (
                      <span key={idx} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicador de Arraste no Centro ao Passar o Mouse */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/10">
                  <Move size={12} />
                  <span>Arraste para posicionar</span>
                </div>
              </div>
            </div>

            {/* Toggle de Exibição do Título e Dica */}
            <div className="flex flex-wrap items-center justify-between w-full gap-2 text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={showTitlePreview}
                  onChange={(e) => setShowTitlePreview(e.target.checked)}
                  className="accent-[#e50914] rounded cursor-pointer"
                />
                <span>Exibir título na prévia</span>
              </label>

              <span className="text-[11px] text-gray-500">
                Pressione e arraste com o mouse para alinhar
              </span>
            </div>
          </div>

          {/* Coluna de Controles */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            {/* Presets Rápidos */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#e50914]" />
                Soluções Rápidas (1 Clique)
              </span>

              <div className="grid grid-cols-1 gap-2">
                {/* Auto Trim Inteligente */}
                <button
                  type="button"
                  onClick={handleAutoTrim}
                  disabled={autoDetecting || saving}
                  className="w-full text-left p-3 rounded-xl bg-gradient-to-r from-[#e50914]/20 to-red-950/40 hover:from-[#e50914]/30 hover:to-red-900/50 border border-[#e50914]/40 hover:border-[#e50914] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white group-hover:text-red-200 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#e50914]" />
                      Remover Tarjas Automaticamente
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Detecta e corta bordas pretas nos 4 cantos
                    </p>
                  </div>
                  {autoDetecting ? (
                    <Loader2 size={16} className="animate-spin text-[#e50914]" />
                  ) : (
                    <span className="text-[10px] font-bold bg-[#e50914] text-white px-2 py-0.5 rounded">
                      AUTO
                    </span>
                  )}
                </button>

                {/* Preset Cinema / Letterbox 2.39:1 (1.18x) */}
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.18);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Preencher Tarjas Cinema (1.18x)
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Ideal para vídeos widescreen / 2.39:1 (ex: Vó - Tio Sam)
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-gray-300 bg-black/40 px-2 py-0.5 rounded">
                    1.18x
                  </span>
                </button>

                {/* Preset YouTube 4:3 (1.34x) */}
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.34);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-200">
                      Preencher Tarjas YouTube 4:3 (1.34x)
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Remove barras padrão de miniaturas 480x360
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-gray-300 bg-black/40 px-2 py-0.5 rounded">
                    1.34x
                  </span>
                </button>
              </div>
            </div>

            {/* Ajustes Manuais Finos */}
            <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#e50914]" />
                  Ajustes Manuais
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.0);
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Resetar</span>
                </button>
              </div>

              {/* Slider de Zoom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium flex items-center gap-1">
                    <ZoomIn size={13} className="text-gray-400" />
                    Zoom / Escala:
                  </span>
                  <span className="font-mono text-white font-bold bg-[#222] px-2 py-0.5 rounded text-[11px]">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(1.0, Number((prev - 0.05).toFixed(2))))}
                    className="p-1 bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white rounded cursor-pointer"
                    title="Diminuir Zoom"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#e50914] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(2.5, Number((prev + 0.05).toFixed(2))))}
                    className="p-1 bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white rounded cursor-pointer"
                    title="Aumentar Zoom"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>
              </div>

              {/* Slider Vertical (Y) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">Posição Vertical (Cima / Baixo):</span>
                  <span className="font-mono text-white font-bold bg-[#222] px-2 py-0.5 rounded text-[11px]">
                    {offsetY > 0 ? `+${offsetY}%` : `${offsetY}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                  className="w-full accent-[#e50914] cursor-pointer"
                />
              </div>

              {/* Slider Horizontal (X) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">Posição Horizontal (Esquerda / Direita):</span>
                  <span className="font-mono text-white font-bold bg-[#222] px-2 py-0.5 rounded text-[11px]">
                    {offsetX > 0 ? `+${offsetX}%` : `${offsetX}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="0.5"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                  className="w-full accent-[#e50914] cursor-pointer"
                />
              </div>
            </div>

            {/* Status / Ações */}
            <div className="space-y-2 pt-2">
              {statusMessage && (
                <p className="text-xs text-center text-amber-300 font-medium animate-pulse">
                  {statusMessage}
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || autoDetecting}
                  className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveManual}
                  disabled={saving || autoDetecting}
                  className="bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Salvar Capa Ajustada</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
