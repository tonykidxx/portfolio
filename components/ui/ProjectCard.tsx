"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import {
  getYouTubeId,
  getRandomYouTubeFrame,
  upgradeYouTubeThumbToHighRes,
  splitTitleIntoTwoLines,
} from "@/lib/video-utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    thumbUrl?: string | null;
    isVertical?: boolean;
  };
  onSelect: (project: any) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const isVert = project.isVertical;
  const ytId = getYouTubeId(project.videoUrl);
  const titleLines = splitTitleIntoTwoLines(project.title);

  // Usa resolução equilibrada (hqdefault 480x360) para grids, evitando baixar dezenas de imagens 1080p simultâneas
  const initialThumb = project.thumbUrl
    ? project.thumbUrl.replace("maxresdefault.jpg", "hqdefault.jpg")
    : ytId
    ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    : null;

  const [thumbSrc, setThumbSrc] = useState<string | null>(initialThumb);
  const [fallbackStep, setFallbackStep] = useState(0);

  const handleImageError = () => {
    if (ytId) {
      if (fallbackStep === 0) {
        setFallbackStep(1);
        setThumbSrc(`https://img.youtube.com/vi/${ytId}/hq720.jpg`);
      } else if (fallbackStep === 1) {
        setFallbackStep(2);
        setThumbSrc(`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
      } else if (fallbackStep === 2) {
        setFallbackStep(3);
        setThumbSrc(`https://img.youtube.com/vi/${ytId}/sddefault.jpg`);
      } else if (fallbackStep === 3) {
        setFallbackStep(4);
        setThumbSrc(`https://img.youtube.com/vi/${ytId}/0.jpg`);
      }
    }
  };

  // Detecta se a imagem possui tarjas pretas padrão do YouTube (formato 4:3 com barras superior/inferior)
  const isLetterboxed =
    !isVert &&
    Boolean(
      thumbSrc?.includes("hqdefault.jpg") ||
        thumbSrc?.includes("sddefault.jpg") ||
        thumbSrc?.includes("hq1.jpg") ||
        thumbSrc?.includes("hq2.jpg") ||
        thumbSrc?.includes("hq3.jpg") ||
        thumbSrc?.includes("0.jpg") ||
        fallbackStep >= 2
    );

  return (
    <div
      onClick={() => onSelect(project)}
      className={`group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-[4px] bg-[#2a2a2a] transition-all duration-200 transform hover:scale-[1.08] hover:z-20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.8)] focus-visible:outline-2 focus-visible:outline-white ${
        isVert
          ? "w-[125px] sm:w-[155px] md:w-[185px] aspect-[9/16]"
          : "w-[180px] sm:w-[230px] md:w-[280px] aspect-[16/9]"
      }`}
    >
      {/* Miniatura do PRÓPRIO vídeo anexado (com preenchimento total e sem tarjas pretas) */}
      {thumbSrc ? (
        <img
          src={thumbSrc}
          alt={project.title}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isLetterboxed ? "scale-y-[1.34] scale-x-[1.01]" : ""
          }`}
        />
      ) : project.videoUrl ? (
        <video
          src={`${project.videoUrl}#t=1`}
          preload="metadata"
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
        />
      ) : (
        <div className="w-full h-full bg-[#2a2a2a]" />
      )}

      {/* Play Icon on Hover */}
      <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="w-11 h-11 rounded-full bg-black/60 border-2 border-white grid place-items-center pl-0.5 shadow-lg">
          <Play fill="white" size={18} className="text-white" />
        </div>
      </div>

      {/* Bottom Title Bar with Gradient positioned at bottom-left */}
      <div className="absolute left-0 right-0 bottom-0 pt-8 pb-2.5 sm:pb-3 px-2.5 sm:px-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent rounded-b-[4px] pointer-events-none text-left">
        <h3
          className={`font-sans font-bold leading-[1.12] tracking-[0.2px] text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] ${
            isVert
              ? "text-sm sm:text-base md:text-lg"
              : "text-base sm:text-lg md:text-xl"
          }`}
        >
          {titleLines.map((line, idx) => (
            <span key={idx} className="block truncate whitespace-nowrap">
              {line}
            </span>
          ))}
        </h3>
        {project.description && (
          <p className="text-gray-300 text-[10px] sm:text-[11px] line-clamp-1 mt-0.5 font-normal font-sans drop-shadow">
            {project.description}
          </p>
        )}
      </div>
    </div>
  );
}
