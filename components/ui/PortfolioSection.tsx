"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { VideoModal } from "./VideoModal";
import { ClientHighlights } from "./ClientHighlights";
import { ServicesSection } from "./ServicesSection";
import { AboutSection } from "./AboutSection";
import { CtaSection } from "./CtaSection";
import { StillsSection } from "./StillsSection";

interface PortfolioSectionProps {
  categories: {
    id: string;
    name: string;
    order?: number;
    projects: {
      id: string;
      title: string;
      description?: string | null;
      videoUrl: string;
      thumbUrl?: string | null;
      isVertical?: boolean;
      isPublished?: boolean;
    }[];
  }[];
  clients?: any[];
  clientsOrder?: number;
  photos?: any[];
  siteSettings?: any;
  onSelectProject?: (project: any) => void;
}

function FadeInSection({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, {
      rootMargin: "0px 0px 50px 0px", // O radar avança 50px para fora da tela, disparando a animação pouco antes de você ver
      threshold: 0
    });
    
    const { current } = domRef;
    if (current) observer.observe(current);
    
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CategoryScroller({ 
  cat, 
  onSelectProject, 
  setSelectedProject 
}: { 
  cat: any, 
  onSelectProject: any, 
  setSelectedProject: any 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 20);
      setShowRight(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 sm:gap-3 overflow-x-auto px-[4%] py-3 hide-scrollbar scroll-smooth"
      >
        {cat.projects.map((project: any) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={(p) => (onSelectProject ? onSelectProject(p) : setSelectedProject(p))}
          />
        ))}
      </div>
      {/* Glassmorphism Swipe Indicator Mobile LEFT */}
      <div className={`absolute left-2 top-1/2 -translate-y-1/2 z-30 sm:hidden pointer-events-none transition-opacity duration-300 ${showLeft ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
        <div className="w-10 h-10 rounded-full bg-black/[0.35] backdrop-blur-sm flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <ChevronLeft size={20} className="text-white opacity-80" />
        </div>
      </div>

      {/* Glassmorphism Swipe Indicator Mobile RIGHT */}
      <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-30 sm:hidden pointer-events-none transition-opacity duration-300 ${showRight ? 'opacity-100 animate-pulse' : 'opacity-0'}`}>
        <div className="w-10 h-10 rounded-full bg-black/[0.35] backdrop-blur-sm flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          <ChevronRight size={20} className="text-white opacity-80" />
        </div>
      </div>
    </div>
  );
}

export function PortfolioSection({
  categories,
  clients,
  clientsOrder = 0,
  photos = [],
  siteSettings,
  onSelectProject,
}: PortfolioSectionProps) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // Filter published projects
  const validCategories = categories
    .map((cat) => ({
      ...cat,
      projects: cat.projects.filter((p) => p.isPublished !== false),
    }))
    .filter((cat) => cat.projects.length > 0);

  // Combina categorias, clientes, fotos e novas seções na ordem definida
  type SectionItem =
    | { type: "clients"; order: number }
    | { type: "photos"; order: number }
    | { type: "services"; order: number }
    | { type: "about"; order: number }
    | { type: "cta"; order: number }
    | { type: "category"; order: number; category: (typeof validCategories)[0] };

  const sections: SectionItem[] = [
    ...(clients && clients.length > 0
      ? [{ type: "clients" as const, order: siteSettings?.clientsOrder ?? clientsOrder }]
      : []),
    ...(photos && photos.length > 0
      ? [{ type: "photos" as const, order: siteSettings?.photosOrder ?? 88 }]
      : []),
    { type: "services" as const, order: siteSettings?.servicesOrder ?? 90 },
    { type: "about" as const, order: siteSettings?.aboutOrder ?? 91 },
    { type: "cta" as const, order: siteSettings?.ctaOrder ?? 92 },
    ...validCategories.map((cat, idx) => ({
      type: "category" as const,
      order: cat.order ?? idx + 1,
      category: cat,
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <section id="portfolio" className="relative z-10 -mt-8 sm:-mt-12">
      {sections.map((item) => {
        if (item.type === "clients") {
          return (
            <FadeInSection key="section-clients" className="py-4 sm:py-6">
              <ClientHighlights clients={clients!} />
            </FadeInSection>
          );
        }

        if (item.type === "photos") {
          return (
            <FadeInSection key="section-stills" className="w-full">
              <StillsSection
                stills={photos!}
                title={siteSettings?.photosTitle || "Stills"}
              />
            </FadeInSection>
          );
        }

        if (item.type === "services") {
          return (
            <FadeInSection key="section-services" className="w-full">
              <ServicesSection
                eyebrow={siteSettings?.servicesEyebrow}
                title={siteSettings?.servicesTitle}
                subtitle={siteSettings?.servicesSubtitle}
                itemsJson={siteSettings?.servicesItems}
              />
            </FadeInSection>
          );
        }

        if (item.type === "about") {
          return (
            <FadeInSection key="section-about" className="w-full">
              <AboutSection
                eyebrow={siteSettings?.aboutEyebrow}
                title={siteSettings?.aboutTitle}
                description={siteSettings?.aboutDescription}
                pillsJson={siteSettings?.aboutPills}
              />
            </FadeInSection>
          );
        }

        if (item.type === "cta") {
          return (
            <FadeInSection key="section-cta" className="w-full">
              <CtaSection
                eyebrow={siteSettings?.ctaEyebrow}
                title={siteSettings?.ctaTitle}
                description={siteSettings?.ctaDescription}
                whatsappText={siteSettings?.ctaWhatsappText}
                instagramText={siteSettings?.ctaInstagramText}
                whatsappUrl={siteSettings?.whatsappUrl}
                instagramUrl={siteSettings?.instagramUrl}
                contactPhone={siteSettings?.contactPhone}
              />
            </FadeInSection>
          );
        }

        const cat = item.category;
        return (
          <FadeInSection key={cat.id} className="py-5 sm:py-7 space-y-3">
            {/* Section Title with ⠿ grip icon exactly matching reference */}
            <div className="flex items-center justify-between px-[4%] pr-[5%]">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 font-sans tracking-[0.3px]">
                <span className="text-[#808080] text-lg select-none leading-none">⠿</span>
                <span>{cat.name}</span>
              </h2>
            </div>

            {/* Horizontal Scroller - starts exactly at px-[4%] */}
            <CategoryScroller 
              cat={cat} 
              onSelectProject={onSelectProject} 
              setSelectedProject={setSelectedProject} 
            />
          </FadeInSection>
        );
      })}

      {/* Video Modal (caso usado isoladamente sem HomeView) */}
      {!onSelectProject && (
        <VideoModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
