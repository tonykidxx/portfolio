import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Default Admin User
  const adminEmail = "admin@candymachine.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin Candy Machine",
      },
    });
    console.log("Created default admin user: admin@candymachine.com / admin123");
  }

  // 2. Create Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteName: "CANDY MACHINE STUDIOS",
      heroTitle: "FILMES, COMERCIAIS E CONTEÚDO CINEMATOGRÁFICO",
      heroSubtitle: "Estúdio criativo especializado em produções de alto impacto visual.",
      contactEmail: "contato@candymachinestudios.com",
    },
  });

  // 3. Create Default Categories
  const categoriesData = [
    { name: "Comerciais & Publicidade", order: 1 },
    { name: "Videoclipes", order: 2 },
    { name: "Documentários & Conteúdo", order: 3 },
    { name: "Conteúdo Vertical / Social", order: 4 },
  ];

  for (const cat of categoriesData) {
    const existingCat = await prisma.category.findFirst({
      where: { name: cat.name },
    });

    if (!existingCat) {
      await prisma.category.create({
        data: cat,
      });
    }
  }

  // 4. Create Initial Projects
  const defaultCategory = await prisma.category.findFirst();
  if (defaultCategory) {
    const existingProjects = await prisma.project.count();
    if (existingProjects === 0) {
      await prisma.project.createMany({
        data: [
          {
            title: "Reel Comercial 2026",
            description: "Showreel com os principais projetos publicitários produzidos.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
            isVertical: false,
            isHero: true,
            isPublished: true,
            order: 1,
            categoryId: defaultCategory.id,
          },
          {
            title: "Campanha Nescafé",
            description: "Comercial para a campanha nacional de lançamento.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
            isVertical: false,
            isHero: false,
            isPublished: true,
            order: 2,
            categoryId: defaultCategory.id,
          },
        ],
      });
      console.log("Seeded initial projects.");
    }
  }

  console.log("Database seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
