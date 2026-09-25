import { prisma } from "@/lib/prisma";
import { PresentationManager } from "@/components/admin/PresentationManager";

export const revalidate = 0;

export default async function PresentationAdminPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const currentHeroProject = await prisma.project.findFirst({
    where: { isHero: true },
    include: { category: true },
  });

  return (
    <PresentationManager
      initialSettings={settings}
      currentHeroProject={currentHeroProject}
    />
  );
}
