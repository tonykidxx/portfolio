import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { notFound } from "next/navigation";

export const revalidate = 0;

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectAdminPage({ params }: EditPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <ProjectForm categories={categories} initialData={project} />
    </div>
  );
}
