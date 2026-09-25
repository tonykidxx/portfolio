"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/ui/Hero";
import { PortfolioSection } from "@/components/ui/PortfolioSection";
import { Footer } from "@/components/ui/Footer";
import { VideoModal } from "@/components/ui/VideoModal";

interface HomeViewProps {
  siteSettings: any;
  heroProject: any;
  categories: any[];
  clients: any[];
  photos?: any[];
}

export function HomeView({
  siteSettings,
  heroProject,
  categories,
  clients,
  photos = [],
}: HomeViewProps) {
  const [activeProject, setActiveProject] = useState<any | null>(null);

  return (
    <main className="min-h-screen bg-[#141414] text-white selection:bg-[#e50914] selection:text-white">
      <Navbar
        siteName={siteSettings?.siteName}
        whatsappUrl={siteSettings?.whatsappUrl}
        instagramUrl={siteSettings?.instagramUrl}
        contactPhone={siteSettings?.contactPhone}
      />

      <Hero
        heroProject={heroProject}
        siteSettings={siteSettings}
        onPlayVideo={(proj) => setActiveProject(proj)}
      />

      <PortfolioSection
        categories={categories}
        clients={clients}
        clientsOrder={siteSettings?.clientsOrder ?? 0}
        photos={photos}
        siteSettings={siteSettings}
        onSelectProject={(proj) => setActiveProject(proj)}
      />

      <Footer
        siteName={siteSettings?.siteName}
        contactEmail={siteSettings?.contactEmail}
      />

      {/* Modal Unificado Global: Reproduz o vídeo de destaque (Hero) ou qualquer item do catálogo */}
      <VideoModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </main>
  );
}
