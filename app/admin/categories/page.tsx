import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const revalidate = 0;

export default async function CategoriesAdminPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { projects: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Categorias</h1>
        <p className="text-sm text-gray-400">
          Gerencie as seções de vídeo que organizam os projetos na Landing Page.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
