import { prisma } from "@/lib/prisma";
import { ProjectList } from "@/components/admin/ProjectList";

export const revalidate = 0;

export default async function ProjectsAdminPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const isPresentationActive = Boolean(
    settings?.presentationEnabled && settings?.presentationVideoUrl
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Projetos</h1>
        <p className="text-sm text-gray-400">
          Gerencie todos os vídeos, thumbnails, visibilidade e destaques do portfólio.
        </p>
      </div>

      <ProjectList
        initialProjects={projects as any}
        isPresentationActive={isPresentationActive}
      />
    </div>
  );
}
