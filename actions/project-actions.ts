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

export async function createProject(data: {
  title: string;
  description?: string;
  videoUrl: string;
  thumbUrl?: string;
  isVertical?: boolean;
  isHero?: boolean;
  isPublished?: boolean;
  categoryId: string;
}) {
  await requireAuth();

  if (!data.title || !data.videoUrl || !data.categoryId) {
    throw new Error("Título, URL do vídeo e Categoria são obrigatórios.");
  }

  // If this project is marked as Hero, remove isHero from others
  if (data.isHero) {
    await prisma.project.updateMany({
      where: { isHero: true },
      data: { isHero: false },
    });
  }

  const maxOrder = await prisma.project.aggregate({
    where: { categoryId: data.categoryId },
    _max: { order: true },
  });

  const nextOrder = (maxOrder._max.order || 0) + 1;

  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description || null,
      videoUrl: data.videoUrl,
      thumbUrl: data.thumbUrl || null,
      isVertical: data.isVertical ?? false,
      isHero: data.isHero ?? false,
      isPublished: data.isPublished ?? true,
      order: nextOrder,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return project;
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbUrl?: string;
    isVertical?: boolean;
    isHero?: boolean;
    isPublished?: boolean;
    categoryId?: string;
    order?: number;
  }
) {
  await requireAuth();

  if (data.isHero) {
    await prisma.project.updateMany({
      where: { isHero: true, NOT: { id } },
      data: { isHero: false },
    });
  }

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return project;
}

export async function deleteProject(id: string) {
  await requireAuth();

  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function setHeroProject(id: string) {
  await requireAuth();

  await prisma.project.updateMany({
    where: { isHero: true },
    data: { isHero: false },
  });

  const project = await prisma.project.update({
    where: { id },
    data: { isHero: true },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return project;
}

export async function reorderProjects(
  items: { id: string; order: number; categoryId?: string }[]
) {
  await requireAuth();

  const updates = items.map((item) =>
    prisma.project.update({
      where: { id: item.id },
      data: {
        order: item.order,
        ...(item.categoryId ? { categoryId: item.categoryId } : {}),
      },
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/organize");
  revalidatePath("/admin/projects");
  return { success: true };
}
