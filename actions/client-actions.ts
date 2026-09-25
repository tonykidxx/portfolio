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

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return clients;
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return [];
  }
}

export async function createClient(data: {
  name: string;
  followers: string;
  imageUrl: string;
  role?: string;
  profileUrl?: string;
}) {
  await requireAuth();

  if (!data.name.trim()) throw new Error("Nome do cliente é obrigatório.");
  if (!data.followers.trim()) throw new Error("Número de seguidores é obrigatório.");
  if (!data.imageUrl.trim()) throw new Error("Foto do cliente é obrigatória.");

  const maxOrder = await prisma.client.aggregate({
    _max: { order: true },
  });

  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const client = await prisma.client.create({
    data: {
      name: data.name.trim(),
      followers: data.followers.trim(),
      imageUrl: data.imageUrl.trim(),
      role: data.role?.trim() || null,
      profileUrl: data.profileUrl?.trim() || null,
      order: nextOrder,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return client;
}

export async function updateClient(
  id: string,
  data: {
    name?: string;
    followers?: string;
    imageUrl?: string;
    role?: string;
    profileUrl?: string;
    order?: number;
  }
) {
  await requireAuth();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.followers !== undefined) updateData.followers = data.followers.trim();
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim();
  if (data.role !== undefined) updateData.role = data.role.trim() || null;
  if (data.profileUrl !== undefined) updateData.profileUrl = data.profileUrl.trim() || null;
  if (data.order !== undefined) updateData.order = data.order;

  const client = await prisma.client.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return client;
}

export async function deleteClient(id: string) {
  await requireAuth();

  await prisma.client.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/clients");
  return { success: true };
}

export async function seedDefaultClients() {
  const count = await prisma.client.count();
  if (count > 0) return;

  const defaultClients = [
    {
      name: "Alok",
      followers: "28.5M seguidores",
      role: "DJ & Produtor",
      imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 1,
    },
    {
      name: "Whindersson Nunes",
      followers: "59.2M seguidores",
      role: "Creator & Comediante",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 2,
    },
    {
      name: "Virginia Fonseca",
      followers: "48.1M seguidores",
      role: "Influencer & Empresária",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 3,
    },
    {
      name: "Pedro Sampaio",
      followers: "10.4M seguidores",
      role: "DJ & Hitmaker",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 4,
    },
    {
      name: "Red Bull Brasil",
      followers: "14.8M seguidores",
      role: "Marca Global",
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 5,
    },
    {
      name: "Anitta",
      followers: "64.7M seguidores",
      role: "Cantora & Empresária",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
      profileUrl: "https://instagram.com",
      order: 6,
    },
  ];

  for (const client of defaultClients) {
    await prisma.client.create({ data: client });
  }
}

export async function reorderClients(items: { id: string; order: number }[]) {
  await requireAuth();

  const updates = items.map((item) =>
    prisma.client.update({
      where: { id: item.id },
      data: { order: item.order },
    })
  );

  await prisma.$transaction(updates);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/organize");
  revalidatePath("/admin/clients");
  return { success: true };
}
