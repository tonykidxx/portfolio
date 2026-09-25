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

export async function updateSiteSettings(data: {
  siteName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  clientsOrder?: number;
  photosOrder?: number;
  photosTitle?: string;
  servicesOrder?: number;
  aboutOrder?: number;
  ctaOrder?: number;
  servicesEyebrow?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  servicesItems?: string;
  aboutEyebrow?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  aboutPills?: string;
  ctaEyebrow?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaWhatsappText?: string;
  ctaInstagramText?: string;
  // Vídeo de Apresentação
  presentationEnabled?: boolean;
  presentationVideoUrl?: string | null;
  presentationTitle?: string | null;
  presentationSubtitle?: string | null;
  presentationCategory?: string | null;
  presentationThumbUrl?: string | null;
  presentationIsVertical?: boolean;
}) {
  await requireAuth();

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      siteName: data.siteName || "CANDY MACHINE STUDIOS",
      ...data,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/presentation");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/organize");
  revalidatePath("/admin/stills");
  revalidatePath("/");
  revalidatePath("/admin");
  return settings;
}
