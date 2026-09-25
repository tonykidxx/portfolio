import { prisma } from "@/lib/prisma";
import { OrganizeManager } from "@/components/admin/OrganizeManager";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OrganizeAdminPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const tabParam = resolvedParams.tab;
  const defaultTab =
    tabParam === "videos"
      ? "videos"
      : tabParam === "clients"
      ? "clients"
      : tabParam === "stills"
      ? "stills"
      : "sections";

  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const clients = await prisma.client.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const stills = await prisma.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      projects: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          videoUrl: true,
          thumbUrl: true,
          isVertical: true,
          order: true,
          categoryId: true,
        },
      },
    },
  });

  const photosCount = stills.length;

  return (
    <OrganizeManager
      initialCategories={categories}
      initialClients={clients}
      initialStills={stills as any}
      initialClientsOrder={siteSettings?.clientsOrder ?? 0}
      initialPhotosOrder={siteSettings?.photosOrder ?? 88}
      initialPhotosCount={photosCount}
      initialPhotosTitle={siteSettings?.photosTitle || "Stills"}
      initialServicesOrder={siteSettings?.servicesOrder ?? 90}
      initialAboutOrder={siteSettings?.aboutOrder ?? 91}
      initialCtaOrder={siteSettings?.ctaOrder ?? 92}
      defaultTab={defaultTab}
    />
  );
}
