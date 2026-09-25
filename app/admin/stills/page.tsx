import { prisma } from "@/lib/prisma";
import { StillsManager } from "@/components/admin/StillsManager";

export const revalidate = 0;

export default async function AdminStillsPage() {
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const stills = await prisma.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <StillsManager
        initialStills={stills as any}
        initialSectionTitle={siteSettings?.photosTitle || "Stills"}
      />
    </div>
  );
}
