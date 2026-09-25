"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Não autorizado.");
  }
  return session;
}

export async function createCategory(name: string) {
  await requireAuth();

  if (!name.trim()) {
    throw new Error("Nome da categoria é obrigatório.");
  }

  const maxOrder = await prisma.category.aggregate({
    _max: { order: true },
  });

  const nextOrder = (maxOrder._max.order || 0) + 1;

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      order: nextOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return category;
}

export async function updateCategory(id: string, name: string) {
  await requireAuth();

  if (!name.trim()) {
    throw new Error("Nome da categoria não pode ser vazio.");
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: name.trim() },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return category;
}

export async function deleteCategory(id: string) {
  await requireAuth();

  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function reorderCategories(items: { id: string; order: number }[]) {
  await requireAuth();

  const updates = items.map((item) =>
    prisma.category.update({
      where: { id: item.id },
      data: { order: item.order },
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/organize");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function reorderPageSections(
  sections: {
    id: string;
    type: "category" | "clients" | "photos" | "services" | "about" | "cta";
    order: number;
  }[]
) {
  await requireAuth();

  const categoryUpdates = sections
    .filter((s) => s.type === "category")
    .map((s) =>
      prisma.category.update({
        where: { id: s.id },
        data: { order: s.order },
      })
    );

  const clientsSection = sections.find((s) => s.type === "clients");
  const photosSection = sections.find((s) => s.type === "photos");
  const servicesSection = sections.find((s) => s.type === "services");
  const aboutSection = sections.find((s) => s.type === "about");
  const ctaSection = sections.find((s) => s.type === "cta");

  const settingsData: Record<string, number> = {};
  if (clientsSection) settingsData.clientsOrder = clientsSection.order;
  if (photosSection) settingsData.photosOrder = photosSection.order;
  if (servicesSection) settingsData.servicesOrder = servicesSection.order;
  if (aboutSection) settingsData.aboutOrder = aboutSection.order;
  if (ctaSection) settingsData.ctaOrder = ctaSection.order;

  const promises: any[] = [...categoryUpdates];

  if (Object.keys(settingsData).length > 0) {
    promises.push(
      prisma.siteSettings.upsert({
        where: { id: "default" },
        update: settingsData,
        create: { id: "default", ...settingsData },
      })
    );
  }

  await prisma.$transaction(promises);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/organize");
  return { success: true };
}
