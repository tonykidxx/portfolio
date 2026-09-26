"use client";

import { useRef } from "react";
import { Users, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export interface ClientItem {
  id: string;
  name: string;
  followers: string;
  imageUrl: string;
  role?: string | null;
  profileUrl?: string | null;
  order?: number;
}

interface ClientHighlightsProps {
  clients: ClientItem[];
}

export function ClientHighlights({ clients }: ClientHighlightsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!clients || clients.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative z-10 pt-2 pb-10 sm:pb-14 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-[4%]">
        <div className="flex items-center gap-2">
          <span className="text-[#808080] text-lg select-none leading-none">⠿</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-sans tracking-[0.3px]">
            Clientes & Criadores
          </h2>
          <span className="hidden sm:inline-block text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium ml-2 font-sans">
            Quem confia em nós
          </span>
        </div>

        {/* Scroll Controls for Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para esquerda"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para direita"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Highlights Circles Horizontal Track */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-start gap-6 sm:gap-8 overflow-x-auto px-[4%] py-2 hide-scrollbar scroll-smooth"
        >
          {clients.map((client) => {
          const content = (
            <div className="group flex flex-col items-center cursor-pointer flex-shrink-0 transition-transform duration-300">
              {/* Clean Circular Avatar without orange ring */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#1a1a1a] shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={client.imageUrl}
                  alt={client.name}
                  className="w-full h-full rounded-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Texts Below */}
              <div className="text-center mt-2.5 max-w-[105px] sm:max-w-[125px] space-y-0.5">
                <h3 className="text-white text-xs sm:text-sm font-semibold tracking-tight truncate group-hover:text-white/80 transition-colors">
                  {client.name}
                </h3>

                <p className="text-[11px] sm:text-xs text-gray-400 font-normal truncate">
                  {client.followers}
                </p>

                {client.role && (
                  <p className="text-[10px] text-gray-500 truncate font-light">
                    {client.role}
                  </p>
                )}
              </div>
            </div>
          );

          if (client.profileUrl) {
            return (
              <a
                key={client.id}
                href={client.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Ver perfil de ${client.name}`}
              >
                {content}
              </a>
            );
          }

          return <div key={client.id}>{content}</div>;
        })}
        </div>
        {/* Glassmorphism Swipe Indicator Mobile */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 sm:hidden pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            <ChevronRight size={20} className="text-white opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
