import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function NewProjectAdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  if (categories.length === 0) {
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <ProjectForm categories={categories} />
    </div>
  );
}
