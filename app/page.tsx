import { prisma } from "@/lib/prisma";
import { HomeView } from "@/components/ui/HomeView";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const clients = await prisma.client.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const photos = await prisma.photo.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  // Se o Vídeo de Apresentação estiver ATIVO no admin, ele substitui o hero e não aparece nas categorias
  let activeHero: any = null;

  if (siteSettings?.presentationEnabled && siteSettings?.presentationVideoUrl) {
    activeHero = {
      id: "presentation-hero-video",
      title:
        siteSettings.presentationTitle ||
        siteSettings.heroTitle ||
        siteSettings.siteName ||
        "CANDY MACHINE STUDIOS",
      description:
        siteSettings.presentationSubtitle || siteSettings.heroSubtitle || null,
      videoUrl: siteSettings.presentationVideoUrl,
      thumbUrl: siteSettings.presentationThumbUrl || null,
      isVertical: siteSettings.presentationIsVertical ?? false,
      category: {
        name: siteSettings.presentationCategory || "Apresentação",
      },
      isPresentation: true,
    };
  } else {
    const heroProject = await prisma.project.findFirst({
      where: { isHero: true, isPublished: true },
      include: { category: true },
    });

    // Fallback to first project if no explicit hero is marked
    activeHero = heroProject
      ? heroProject
      : await prisma.project.findFirst({
          where: { isPublished: true },
          include: { category: true },
        });
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      projects: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <HomeView
      siteSettings={siteSettings}
      heroProject={activeHero}
      categories={categories as any}
      clients={clients}
      photos={photos}
    />
  );
}
