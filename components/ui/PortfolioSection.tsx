"use client";

import { useState } from "react";
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
            <div key="section-clients" className="py-4 sm:py-6">
              <ClientHighlights clients={clients!} />
            </div>
          );
        }

        if (item.type === "photos") {
          return (
            <div key="section-stills" className="w-full">
              <StillsSection
                stills={photos!}
                title={siteSettings?.photosTitle || "Stills"}
              />
            </div>
          );
        }

        if (item.type === "services") {
          return (
            <div key="section-services" className="w-full">
              <ServicesSection
                eyebrow={siteSettings?.servicesEyebrow}
                title={siteSettings?.servicesTitle}
                subtitle={siteSettings?.servicesSubtitle}
                itemsJson={siteSettings?.servicesItems}
              />
            </div>
          );
        }

        if (item.type === "about") {
          return (
            <div key="section-about" className="w-full">
              <AboutSection
                eyebrow={siteSettings?.aboutEyebrow}
                title={siteSettings?.aboutTitle}
                description={siteSettings?.aboutDescription}
                pillsJson={siteSettings?.aboutPills}
              />
            </div>
          );
        }

        if (item.type === "cta") {
          return (
            <div key="section-cta" className="w-full">
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
            </div>
          );
        }

        const cat = item.category;
        return (
          <div key={cat.id} className="py-5 sm:py-7 space-y-3">
            {/* Section Title with ⠿ grip icon exactly matching reference */}
            <h2 className="text-xl sm:text-2xl font-bold text-white px-[4%] flex items-center gap-2 font-sans tracking-[0.3px]">
              <span className="text-[#808080] text-lg select-none leading-none">⠿</span>
              <span>{cat.name}</span>
            </h2>

            {/* Horizontal Scroller - starts exactly at px-[4%] */}
            <div className="flex gap-2 sm:gap-3 overflow-x-auto px-[4%] py-3 hide-scrollbar scroll-smooth">
              {cat.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={(p) => (onSelectProject ? onSelectProject(p) : setSelectedProject(p))}
                />
              ))}
            </div>
          </div>
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
