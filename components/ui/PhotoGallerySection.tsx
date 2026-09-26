"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Eye,
} from "lucide-react";

interface PhotoItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  category?: string | null;
  order: number;
}

interface PhotoGallerySectionProps {
  photos: PhotoItem[];
  siteSettings?: any;
}

export function PhotoGallerySection({
  photos = [],
  siteSettings,
}: PhotoGallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Categorias únicas existentes nas fotos
  const categories = [
    "Todos",
    ...Array.from(
      new Set(
        photos
          .map((p) => p.category?.trim())
          .filter((c): c is string => Boolean(c))
      )
    ),
  ];

  const filteredPhotos =
    activeCategory === "Todos"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  // Navegação no Lightbox
  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredPhotos.length - 1
    );
  }, [lightboxIndex, filteredPhotos.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! < filteredPhotos.length - 1 ? prev! + 1 : 0
    );
  }, [lightboxIndex, filteredPhotos.length]);

  // Suporte a teclado no lightbox (ESC, Seta Esquerda, Seta Direita)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  if (!photos || photos.length === 0) return null;

  const eyebrow = siteSettings?.photosEyebrow || "DIREÇÃO DE FOTOGRAFIA & STILL";
  const title = siteSettings?.photosTitle || "ENSAIOS, STILL & EDITORIAL";
  const subtitle =
    siteSettings?.photosSubtitle ||
    "Capturas fotográficas com iluminação cinematográfica, olhar autoral e identidade estética.";

  const activePhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="fotografia" className="py-16 sm:py-24 px-[4%] bg-[#121212]/90 border-t border-white/5 relative">
      {/* Background glow cinematográfico */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-red-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-950/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[#e50914] text-xs sm:text-sm font-black tracking-[3px] uppercase flex items-center gap-2">
              <Camera size={16} />
              {eyebrow}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              {title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Filtros de Categoria */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#e50914] text-white shadow-lg shadow-red-950/40"
                      : "bg-[#222] text-gray-400 hover:text-white hover:bg-[#2e2e2e] border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-[6px] overflow-hidden bg-[#1c1c1c] border border-white/10 cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:z-20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.85)] hover:border-white/30"
            >
              {/* Imagem */}
              <img
                src={photo.imageUrl}
                alt={photo.title || "Fotografia"}
                decoding="async"
                onLoad={(e) => e.currentTarget.classList.remove('opacity-0')}
                className="w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:scale-108"
              />

              {/* Overlay Escuro com Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Tag da Categoria no Topo */}
              {photo.category && (
                <div className="absolute top-2.5 left-2.5">
                  <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/10">
                    {photo.category}
                  </span>
                </div>
              )}

              {/* Ícone de Expansão no Topo Direito */}
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-black/70 backdrop-blur-xs text-white rounded-full border border-white/20">
                  <Maximize2 size={13} />
                </div>
              </div>

              {/* Informações na Base */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                {photo.title && (
                  <h3 className="text-white text-xs sm:text-sm md:text-base font-bold uppercase tracking-tight line-clamp-1 drop-shadow-md">
                    {photo.title}
                  </h3>
                )}
                {photo.subtitle && (
                  <p className="text-gray-300 text-[11px] sm:text-xs font-normal mt-0.5 line-clamp-1 drop-shadow">
                    {photo.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal em Tela Cheia */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Botão Fechar */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 bg-[#222]/80 hover:bg-[#333] text-gray-300 hover:text-white rounded-full transition-colors cursor-pointer border border-white/10 shadow-lg"
            title="Fechar (ESC)"
          >
            <X size={22} />
          </button>

          {/* Contador de Fotos */}
          <div className="absolute top-5 left-5 z-50 text-xs font-mono text-gray-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
            {lightboxIndex! + 1} / {filteredPhotos.length}
          </div>

          {/* Botão Anterior */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/60 hover:bg-[#e50914] text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-2xl hover:scale-110"
            title="Foto Anterior (Seta Esquerda)"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Botão Próximo */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/60 hover:bg-[#e50914] text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-2xl hover:scale-110"
            title="Próxima Foto (Seta Direita)"
          >
            <ChevronRight size={24} />
          </button>

          {/* Conteúdo Central */}
          <div
            className="relative max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.title || "Fotografia"}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.95)] border border-white/10"
            />

            {/* Legenda */}
            {(activePhoto.title || activePhoto.subtitle) && (
              <div className="mt-4 text-center space-y-1 max-w-lg px-4">
                {activePhoto.title && (
                  <h4 className="text-white text-lg sm:text-xl font-bold uppercase tracking-wide">
                    {activePhoto.title}
                  </h4>
                )}
                {activePhoto.subtitle && (
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {activePhoto.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
