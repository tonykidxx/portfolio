"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface StillItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  order: number;
}

interface StillsSectionProps {
  stills: StillItem[];
  title?: string;
}

export function StillsSection({ stills = [], title = "Stills" }: StillsSectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : stills.length - 1));
  }, [lightboxIndex, stills.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < stills.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, stills.length]);

  // Bloqueia a rolagem da página ao fundo enquanto a foto estiver aberta em tela cheia
  useEffect(() => {
    if (lightboxIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, handlePrev, handleNext]);

  if (!stills || stills.length === 0) return null;

  const activeStill = lightboxIndex !== null ? stills[lightboxIndex] : null;

  const lightboxModal = activeStill ? (
    <div
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={() => setLightboxIndex(null)}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Botão Fechar Exclusivo no Canto Superior Direito */}
      <button
        onClick={() => setLightboxIndex(null)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 bg-white/10 hover:bg-[#e50914] text-white rounded-full transition-all cursor-pointer backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
        title="Fechar (ESC)"
        aria-label="Fechar visualização"
      >
        <X size={22} className="sm:w-6 sm:h-6" />
      </button>

      {/* Contador de Frames no Canto Superior Esquerdo */}
      <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-50 text-xs font-mono text-gray-300 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
        {lightboxIndex! + 1} / {stills.length}
      </div>

      {/* Botão Anterior */}
      {stills.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/70 hover:bg-[#e50914] text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-2xl hover:scale-110 active:scale-95"
          title="Frame Anterior (Seta Esquerda)"
          aria-label="Frame Anterior"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Botão Próximo */}
      {stills.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/70 hover:bg-[#e50914] text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-2xl hover:scale-110 active:scale-95"
          title="Próximo Frame (Seta Direita)"
          aria-label="Próximo Frame"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Frame em Tela Cheia - Cantos Levemente Arredondados e Sem Contorno Fino */}
      <div
        className="relative max-w-6xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={activeStill.imageUrl}
          alt={activeStill.title || "Still"}
          className="max-w-full max-h-[80vh] object-contain rounded-xl sm:rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
        />

        {activeStill.title && (
          <div className="mt-3.5 text-center space-y-0.5 max-w-lg px-4">
            <h4 className="text-white text-base sm:text-lg font-bold uppercase tracking-wide">
              {activeStill.title}
            </h4>
            {activeStill.subtitle && (
              <p className="text-gray-400 text-xs">{activeStill.subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="py-5 sm:py-7 space-y-3">
      {/* Título com ícone ⠿ exatamente igual às categorias de vídeo */}
      <div className="flex items-center justify-between px-[4%] pr-[5%]">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-sans tracking-[0.3px]">
          <span className="text-[#808080] text-lg select-none leading-none">⠿</span>
          <span>{title}</span>
        </h2>
      </div>

      {/* Carrossel horizontal de frames - começa exatamente no canto esquerdo (px-[4%]) */}
      <div className="relative">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto px-[4%] py-3 hide-scrollbar scroll-smooth">
          {stills.map((still, idx) => (
          <div
            key={still.id}
            onClick={() => setLightboxIndex(idx)}
            className="group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-[#2a2a2a] transition-all duration-200 transform hover:scale-[1.06] hover:z-20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.8)] focus-visible:outline-2 focus-visible:outline-white w-[180px] sm:w-[230px] md:w-[280px] aspect-[16/9]"
          >
            <img
              src={still.imageUrl}
              alt={still.title || "Frame"}
              loading="eager"
              fetchPriority="high"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Ícone sutil de expandir ao passar o mouse */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-1.5 rounded-full border border-white/20 text-white">
              <Maximize2 size={12} />
            </div>

            {/* Título do Projeto no canto inferior esquerdo */}
            {still.title && (
              <div className="absolute left-0 right-0 bottom-0 pt-6 pb-2 px-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-b-lg sm:rounded-b-xl">
                <p className="text-white text-xs sm:text-sm font-bold uppercase truncate font-sans tracking-[0.2px] drop-shadow-md">
                  {still.title}
                </p>
                {still.subtitle && (
                  <p className="text-gray-300 text-[10px] sm:text-[11px] truncate font-normal font-sans drop-shadow">
                    {still.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        </div>
        {/* Glassmorphism Swipe Indicator Mobile */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 sm:hidden pointer-events-none animate-pulse">
          <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
            <ChevronRight size={20} className="text-white opacity-70" />
          </div>
        </div>
      </div>

      {/* Modal renderizado via Portal diretamente no body com z-index absoluto */}
      {mounted && lightboxModal ? createPortal(lightboxModal, document.body) : null}
    </div>
  );
}
