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

export async function getPhotos() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return photos;
  } catch (error) {
    console.error("Erro ao buscar fotos:", error);
    return [];
  }
}

export async function createPhoto(data: {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  category?: string;
}) {
  await requireAuth();

  if (!data.imageUrl.trim()) throw new Error("A imagem da foto é obrigatória.");

  const maxOrder = await prisma.photo.aggregate({
    _max: { order: true },
  });

  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const photo = await prisma.photo.create({
    data: {
      title: data.title?.trim() || null,
      subtitle: data.subtitle?.trim() || null,
      imageUrl: data.imageUrl.trim(),
      category: data.category?.trim() || "Editorial",
      order: nextOrder,
      isPublished: true,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
  revalidatePath("/admin/stills");
  return photo;
}

export async function updateStillsSectionTitle(title: string) {
  await requireAuth();

  const trimmed = title.trim() || "Stills";

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { photosTitle: trimmed },
    create: { id: "default", photosTitle: trimmed },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/stills");
  revalidatePath("/admin/organize");
  revalidatePath("/admin/settings");

  return { success: true, title: trimmed };
}

export async function createMultiplePhotos(photos: {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  category?: string;
}[]) {
  await requireAuth();

  if (!photos || photos.length === 0) return [];

  const maxOrder = await prisma.photo.aggregate({
    _max: { order: true },
  });

  let currentOrder = (maxOrder._max.order ?? -1) + 1;

  const createdList = [];
  for (const p of photos) {
    if (!p.imageUrl) continue;
    const created = await prisma.photo.create({
      data: {
        imageUrl: p.imageUrl,
        title: p.title?.trim() || null,
        subtitle: p.subtitle?.trim() || null,
        category: p.category?.trim() || "Editorial",
        order: currentOrder++,
        isPublished: true,
      },
    });
    createdList.push(created);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
  revalidatePath("/admin/stills");
  return createdList;
}

export async function updatePhoto(
  id: string,
  data: Partial<{
    title: string | null;
    subtitle: string | null;
    imageUrl: string;
    category: string;
    isPublished: boolean;
  }>
) {
  await requireAuth();

  const photo = await prisma.photo.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
  revalidatePath("/admin/stills");
  return photo;
}

export async function deletePhoto(id: string) {
  await requireAuth();

  await prisma.photo.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/stills");
  revalidatePath("/admin/organize");
  revalidatePath("/");
  return { success: true };
}

export async function reorderPhotos(items: { id: string; order: number }[]) {
  await requireAuth();

  await prisma.$transaction(
    items.map((item) =>
      prisma.photo.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
  revalidatePath("/admin/stills");
  return { success: true };
}

export async function togglePhotoPublished(id: string, isPublished: boolean) {
  await requireAuth();

  const photo = await prisma.photo.update({
    where: { id },
    data: { isPublished },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/photos");
  revalidatePath("/admin/stills");
  return photo;
}

export async function seedDefaultPhotos() {
  const count = await prisma.photo.count();
  if (count > 0) return;

  const defaultPhotos = [
    {
      title: "LUZ NATURAL & SOMBRA",
      subtitle: "Editorial de Moda",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=85",
      category: "Editorial",
      order: 0,
    },
    {
      title: "CINEMATIC STILL LIFE",
      subtitle: "Campanha de Produto",
      imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=85",
      category: "Still",
      order: 1,
    },
    {
      title: "RETRATO EM FOCO",
      subtitle: "Ensaio Artístico",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=85",
      category: "Retrato",
      order: 2,
    },
    {
      title: "ATMOSFERA NOTURNA",
      subtitle: "Direção de Fotografia",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=85",
      category: "Campanha",
      order: 3,
    },
    {
      title: "TEXTURAS & CONTRASTE",
      subtitle: "Fotografia Publicitária",
      imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&auto=format&fit=crop&q=85",
      category: "Editorial",
      order: 4,
    },
    {
      title: "BASTIDORES EM AÇÃO",
      subtitle: "Making Of & Cena",
      imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=85",
      category: "Bastidores",
      order: 5,
    },
  ];

  await prisma.photo.createMany({
    data: defaultPhotos,
  });
}
