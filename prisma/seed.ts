import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with full portfolio data...");

  // 1. Admin User
  const adminEmail = "admin@candymachine.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        id: "cmueebrrf0000rw8y1dwzlub6",
        email: adminEmail,
        password: "$2b$10$V7Duai4RsbglMrmpRBMyau3xIFaNWbMQnyymb92jvSdnXnAkwmFWC",
        name: "Admin Candy Machine",
      },
    });
    console.log("Created admin user: " + adminEmail);
  }

  // 2. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      "id": "default",
      "siteName": "CANDY MACHINE STUDIOS",
      "heroTitle": "FILMES, COMERCIAIS E CONTEÚDO CINEMATOGRÁFICO",
      "heroSubtitle": "Estúdio criativo especializado em produções de alto impacto visual.",
      "heroVideoId": null,
      "contactEmail": "contato@candymachinestudios.com",
      "contactPhone": "+5519991541720",
      "instagramUrl": "https://www.instagram.com/candymachinestudios/",
      "whatsappUrl": "https://wa.me/5519991541720",
      "presentationEnabled": false,
      "presentationVideoUrl": null,
      "presentationTitle": null,
      "presentationSubtitle": null,
      "presentationCategory": "Apresentação",
      "presentationThumbUrl": null,
      "presentationIsVertical": false,
      "clientsOrder": 2,
      "photosOrder": 7,
      "servicesOrder": 5,
      "aboutOrder": 6,
      "ctaOrder": 8,
      "photosEyebrow": "DIREÇÃO DE FOTOGRAFIA & STILL",
      "photosTitle": "Fotografia",
      "photosSubtitle": "Capturas fotográficas com iluminação cinematográfica, olhar autoral e identidade estética.",
      "servicesEyebrow": "O QUE FAZEMOS",
      "servicesTitle": "Da ideia à entrega final.",
      "servicesSubtitle": "",
      "servicesItems": null,
      "aboutEyebrow": "CANDY MACHINE STUDIOS",
      "aboutTitle": "IMAGEM COM INTENÇÃO.\nCONTEÚDO COM IDENTIDADE.",
      "aboutDescription": "Somos um estúdio criativo focado em transformar conceito em imagem. Trabalhamos entre direção criativa, audiovisual, conteúdo e pós-produção para construir projetos que tenham unidade estética, personalidade e valor de marca.",
      "aboutPills": null,
      "ctaEyebrow": "NOVO PROJETO",
      "ctaTitle": "VAMOS CRIAR ALGUMA COISA QUE VALHA SER LEMBRADA?",
      "ctaDescription": "Conte sua ideia. A gente pensa na melhor forma de transformar o conceito em imagem e torná-lo realidade.",
      "ctaWhatsappText": "Falar no WhatsApp",
      "ctaInstagramText": "Ver Instagram",
      "createdAt": "2026-09-23T17:47:50.480Z",
      "updatedAt": "2026-09-25T06:20:40.447Z"
},
    create: {
      "id": "default",
      "siteName": "CANDY MACHINE STUDIOS",
      "heroTitle": "FILMES, COMERCIAIS E CONTEÚDO CINEMATOGRÁFICO",
      "heroSubtitle": "Estúdio criativo especializado em produções de alto impacto visual.",
      "heroVideoId": null,
      "contactEmail": "contato@candymachinestudios.com",
      "contactPhone": "+5519991541720",
      "instagramUrl": "https://www.instagram.com/candymachinestudios/",
      "whatsappUrl": "https://wa.me/5519991541720",
      "presentationEnabled": false,
      "presentationVideoUrl": null,
      "presentationTitle": null,
      "presentationSubtitle": null,
      "presentationCategory": "Apresentação",
      "presentationThumbUrl": null,
      "presentationIsVertical": false,
      "clientsOrder": 2,
      "photosOrder": 7,
      "servicesOrder": 5,
      "aboutOrder": 6,
      "ctaOrder": 8,
      "photosEyebrow": "DIREÇÃO DE FOTOGRAFIA & STILL",
      "photosTitle": "Fotografia",
      "photosSubtitle": "Capturas fotográficas com iluminação cinematográfica, olhar autoral e identidade estética.",
      "servicesEyebrow": "O QUE FAZEMOS",
      "servicesTitle": "Da ideia à entrega final.",
      "servicesSubtitle": "",
      "servicesItems": null,
      "aboutEyebrow": "CANDY MACHINE STUDIOS",
      "aboutTitle": "IMAGEM COM INTENÇÃO.\nCONTEÚDO COM IDENTIDADE.",
      "aboutDescription": "Somos um estúdio criativo focado em transformar conceito em imagem. Trabalhamos entre direção criativa, audiovisual, conteúdo e pós-produção para construir projetos que tenham unidade estética, personalidade e valor de marca.",
      "aboutPills": null,
      "ctaEyebrow": "NOVO PROJETO",
      "ctaTitle": "VAMOS CRIAR ALGUMA COISA QUE VALHA SER LEMBRADA?",
      "ctaDescription": "Conte sua ideia. A gente pensa na melhor forma de transformar o conceito em imagem e torná-lo realidade.",
      "ctaWhatsappText": "Falar no WhatsApp",
      "ctaInstagramText": "Ver Instagram",
      "createdAt": "2026-09-23T17:47:50.480Z",
      "updatedAt": "2026-09-25T06:20:40.447Z"
},
  });
  console.log("Seeded SiteSettings.");

  // 3. Categories & Projects
  const categories = [
    {
        "id": "cmuev6i4o000lj50rf0j1a9jw",
        "name": "Comercial",
        "order": 1,
        "createdAt": "2026-09-24T01:39:38.184Z",
        "updatedAt": "2026-09-25T02:12:56.626Z"
    },
    {
        "id": "cmuetoqzi000bj50rjvavjhfh",
        "name": "Reels & Anúncios",
        "order": 3,
        "createdAt": "2026-09-24T00:57:50.238Z",
        "updatedAt": "2026-09-25T02:12:56.626Z"
    },
    {
        "id": "cmueuxerx000ej50rn07zi114",
        "name": "Video Clipes",
        "order": 4,
        "createdAt": "2026-09-24T01:32:33.933Z",
        "updatedAt": "2026-09-25T02:12:56.626Z"
    }
];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, order: cat.order },
      create: { id: cat.id, name: cat.name, order: cat.order },
    });
  }
  console.log("Seeded " + categories.length + " categories.");

  const projects = [
    {
        "id": "cmueyf3ci0001wpnjzmmxspey",
        "title": "ART'N & FAST ENGENHARIA",
        "description": "",
        "videoUrl": "https://youtu.be/WcbeumBxJPI",
        "thumbUrl": "/uploads/thumb-1790298356665-9ycyb.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 1,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-24T03:10:17.778Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmuev0zn4000ij50ri91oapzx",
        "title": "LIVIN' ON A PRAYER CLASS ROCK",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=XcBAr2eqdqs&list=RDXcBAr2eqdqs&start_radio=1",
        "thumbUrl": "https://img.youtube.com/vi/XcBAr2eqdqs/maxresdefault.jpg",
        "isVertical": false,
        "isHero": true,
        "isPublished": true,
        "order": 1,
        "categoryId": "cmueuxerx000ej50rn07zi114",
        "createdAt": "2026-09-24T01:35:20.945Z",
        "updatedAt": "2026-09-25T00:05:20.149Z"
    },
    {
        "id": "cmuevb8e3000pj50r10f43rdn",
        "title": "SARTORI BARBER SHOP",
        "description": null,
        "videoUrl": "https://youtu.be/xRwNrm4c_rU",
        "thumbUrl": "https://img.youtube.com/vi/xRwNrm4c_rU/maxresdefault.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 2,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-24T01:43:18.844Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmueuz5t9000gj50r4ukdeq74",
        "title": "DOIS ROLEX CODY",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=vDNJ1Su08Go&list=RDvDNJ1Su08Go&start_radio=1",
        "thumbUrl": "https://img.youtube.com/vi/vDNJ1Su08Go/maxresdefault.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 2,
        "categoryId": "cmueuxerx000ej50rn07zi114",
        "createdAt": "2026-09-24T01:33:55.630Z",
        "updatedAt": "2026-09-25T01:18:52.002Z"
    },
    {
        "id": "cmuejyslx000aj50rjff45qkv",
        "title": "ÓH QUEM FALA!",
        "description": "",
        "videoUrl": "/uploads/1790195137250-l3e17k.mp4",
        "thumbUrl": "",
        "isVertical": true,
        "isHero": false,
        "isPublished": true,
        "order": 3,
        "categoryId": "cmuetoqzi000bj50rjvavjhfh",
        "createdAt": "2026-09-23T20:25:42.741Z",
        "updatedAt": "2026-09-25T01:37:58.204Z"
    },
    {
        "id": "cmuev5cq6000kj50r2trsve1f",
        "title": "VÓ TIO SAM",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=LT6XSGtpkMM&list=RDLT6XSGtpkMM&start_radio=1",
        "thumbUrl": "/uploads/thumb-vo-tio-sam-adjusted.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 3,
        "categoryId": "cmueuxerx000ej50rn07zi114",
        "createdAt": "2026-09-24T01:38:44.526Z",
        "updatedAt": "2026-09-25T01:14:25.233Z"
    },
    {
        "id": "cmugjid5g000yakxywfdubqvv",
        "title": "MENTORIA ITALIANI SHIRATORI",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=tqUnAtuldl0",
        "thumbUrl": "/uploads/1790315453919-5lodt2.png",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 3,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-25T05:48:28.564Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmuev7x2z000nj50rmoqjsjpg",
        "title": "BRAVO BET",
        "description": null,
        "videoUrl": "https://youtu.be/LxPKBbZalhk",
        "thumbUrl": "https://img.youtube.com/vi/LxPKBbZalhk/maxresdefault.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 4,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-24T01:40:44.219Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmuewfuts0003f14kyj90xkwv",
        "title": "MARIANO & JAKELYNE",
        "description": "",
        "videoUrl": "https://youtube.com/shorts/m0v1YDwKD0w",
        "thumbUrl": "/uploads/1790216068516-n004wr.JPG",
        "isVertical": true,
        "isHero": false,
        "isPublished": true,
        "order": 4,
        "categoryId": "cmuetoqzi000bj50rjvavjhfh",
        "createdAt": "2026-09-24T02:14:54.160Z",
        "updatedAt": "2026-09-24T02:48:08.801Z"
    },
    {
        "id": "cmug9y8nc0001kmwvldd43oof",
        "title": "ITALIANI SHIRATORI",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=Bc3Yr1OOUXk",
        "thumbUrl": "/uploads/thumb-1790299297591-uiatq.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 5,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-25T01:20:53.064Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmuexif9r0001r4utoz7woxm7",
        "title": "NESTON",
        "description": "",
        "videoUrl": "https://youtube.com/shorts/gVLDeg8Bs8w",
        "thumbUrl": "https://img.youtube.com/vi/gVLDeg8Bs8w/maxresdefault.jpg",
        "isVertical": true,
        "isHero": false,
        "isPublished": true,
        "order": 5,
        "categoryId": "cmuetoqzi000bj50rjvavjhfh",
        "createdAt": "2026-09-24T02:44:53.583Z",
        "updatedAt": "2026-09-24T04:14:11.172Z"
    },
    {
        "id": "cmuey6g0g0004r4utqrj5a2z7",
        "title": "BIS SIGMA 2026",
        "description": null,
        "videoUrl": "https://youtube.com/shorts/JTXWPlEs4wI",
        "thumbUrl": "https://img.youtube.com/vi/JTXWPlEs4wI/maxresdefault.jpg",
        "isVertical": true,
        "isHero": false,
        "isPublished": true,
        "order": 6,
        "categoryId": "cmuetoqzi000bj50rjvavjhfh",
        "createdAt": "2026-09-24T03:03:34.288Z",
        "updatedAt": "2026-09-24T04:14:11.176Z"
    },
    {
        "id": "cmuevsjc90001f14kjmpx3vx2",
        "title": "FAZENDA SANTA LÚCIA",
        "description": "",
        "videoUrl": "https://www.youtube.com/watch?v=J-TV-rUOgSw",
        "thumbUrl": "/uploads/thumb-1790298475391-z92zw.jpg",
        "isVertical": false,
        "isHero": false,
        "isPublished": true,
        "order": 6,
        "categoryId": "cmuev6i4o000lj50rf0j1a9jw",
        "createdAt": "2026-09-24T01:56:46.185Z",
        "updatedAt": "2026-09-25T05:52:48.807Z"
    },
    {
        "id": "cmugagr3d0004kmwvy1zkd9gr",
        "title": "NEED FOR TUNING",
        "description": null,
        "videoUrl": "https://youtube.com/shorts/bgw_E6UmE5Y",
        "thumbUrl": "/uploads/thumb-1790300097796-vu6ga.jpg",
        "isVertical": true,
        "isHero": false,
        "isPublished": true,
        "order": 7,
        "categoryId": "cmuetoqzi000bj50rjvavjhfh",
        "createdAt": "2026-09-25T01:35:16.777Z",
        "updatedAt": "2026-09-25T01:35:16.777Z"
    }
];
  for (const proj of projects) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {
        title: proj.title,
        description: proj.description,
        videoUrl: proj.videoUrl,
        thumbUrl: proj.thumbUrl,
        isVertical: proj.isVertical,
        isHero: proj.isHero,
        isPublished: proj.isPublished,
        order: proj.order,
        categoryId: proj.categoryId,
      },
      create: {
        id: proj.id,
        title: proj.title,
        description: proj.description,
        videoUrl: proj.videoUrl,
        thumbUrl: proj.thumbUrl,
        isVertical: proj.isVertical,
        isHero: proj.isHero,
        isPublished: proj.isPublished,
        order: proj.order,
        categoryId: proj.categoryId,
      },
    });
  }
  console.log("Seeded " + projects.length + " projects.");

  // 4. Clients
  const clients = [
    {
        "id": "cmuef433i0000j50rsviwgzrf",
        "name": "Mariano",
        "followers": "3.9M seguidores",
        "imageUrl": "/uploads/1790187707341-eig1y3.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/mariano/",
        "order": 1,
        "createdAt": "2026-09-23T18:09:51.535Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuef433t0002j50ruwkmi3zg",
        "name": "Jakelyne",
        "followers": "2.9M seguidores",
        "imageUrl": "/uploads/1790187841830-egd51y.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/jaakelyne/",
        "order": 2,
        "createdAt": "2026-09-23T18:09:51.545Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuef433y0003j50rxswv8dyo",
        "name": "Michel Elias",
        "followers": "1.5M seguidores",
        "imageUrl": "/uploads/1790187900614-t3isqg.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/omichelias/",
        "order": 3,
        "createdAt": "2026-09-23T18:09:51.550Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuef433o0001j50rp946w3d3",
        "name": "Neston",
        "followers": "69,4 mil seguidores",
        "imageUrl": "/uploads/1790187821664-47kj4v.svg",
        "role": null,
        "profileUrl": "https://www.instagram.com/neston/",
        "order": 4,
        "createdAt": "2026-09-23T18:09:51.541Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuga355n0002kmwvcgfagmvr",
        "name": "Need For Tuning",
        "followers": "54,7 mil seguidores",
        "imageUrl": "/uploads/1790299445839-imttc0.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/needfortuningbr/",
        "order": 5,
        "createdAt": "2026-09-25T01:24:41.819Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuef43440004j50r2rnk3qg4",
        "name": "Sartori",
        "followers": "92 mil seguidores",
        "imageUrl": "/uploads/1790187962874-a8b658.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/sartorii/",
        "order": 6,
        "createdAt": "2026-09-23T18:09:51.556Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuf081xc000013tuag2f9z0s",
        "name": "Italiani Shiratori",
        "followers": "3,5 mil seguidores",
        "imageUrl": "/uploads/1790222447035-raqvy1.jpg",
        "role": null,
        "profileUrl": null,
        "order": 7,
        "createdAt": "2026-09-24T04:00:48.577Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuefuq7u0007j50r730skiql",
        "name": "Art'N Envelopamento",
        "followers": "10 mil seguidores",
        "imageUrl": "/uploads/1790188232699-7jmajs.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/artnenvelopamento/",
        "order": 8,
        "createdAt": "2026-09-23T18:30:34.555Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuefsc4j0006j50rd5jssdah",
        "name": "Óh Quem Fala",
        "followers": "300 seguidores",
        "imageUrl": "/uploads/1790188121607-bnygug.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/ohquemfala.indaiatuba/",
        "order": 9,
        "createdAt": "2026-09-23T18:28:42.979Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuexw8v40002r4utirlgna75",
        "name": "Back To Basics",
        "followers": "1,1 mil seguidores",
        "imageUrl": "/uploads/1790218535729-obv7lg.jpg",
        "role": null,
        "profileUrl": null,
        "order": 10,
        "createdAt": "2026-09-24T02:55:38.464Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuef434f0005j50rg01nwbag",
        "name": "FMG",
        "followers": "1,4 mil seguidores",
        "imageUrl": "/uploads/1790188009288-y6wjql.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/agencia.fmg/",
        "order": 11,
        "createdAt": "2026-09-23T18:09:51.567Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    },
    {
        "id": "cmuevlrys000qj50r0ixqyr09",
        "name": "Fazenda Santa Lúcia",
        "followers": "7,2 mil seguidores",
        "imageUrl": "/uploads/1790214686246-785ctl.jpg",
        "role": null,
        "profileUrl": "https://www.instagram.com/cafefazendasantalucia/",
        "order": 12,
        "createdAt": "2026-09-24T01:51:30.773Z",
        "updatedAt": "2026-09-25T01:24:58.706Z"
    }
];
  for (const cl of clients) {
    await prisma.client.upsert({
      where: { id: cl.id },
      update: {
        name: cl.name,
        followers: cl.followers,
        imageUrl: cl.imageUrl,
        role: cl.role,
        profileUrl: cl.profileUrl,
        order: cl.order,
      },
      create: {
        id: cl.id,
        name: cl.name,
        followers: cl.followers,
        imageUrl: cl.imageUrl,
        role: cl.role,
        profileUrl: cl.profileUrl,
        order: cl.order,
      },
    });
  }
  console.log("Seeded " + clients.length + " clients.");

  // 5. Photos
  const photos = [
    {
        "id": "cmugfsfep000takxy04lfxys6",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790309059542-lb7n54.png",
        "category": "Still",
        "order": 0,
        "isPublished": true,
        "createdAt": "2026-09-25T04:04:19.586Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugfdqir000makxy3aqnxdcb",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790308373738-fcx85o.png",
        "category": "Still",
        "order": 1,
        "isPublished": true,
        "createdAt": "2026-09-25T03:52:54.147Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugg32gg000uakxy2y4g3r35",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790309555957-4o3jso.png",
        "category": "Still",
        "order": 2,
        "isPublished": true,
        "createdAt": "2026-09-25T04:12:36.017Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugfdqj2000nakxy1x4sybex",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790308373859-kz13t4.png",
        "category": "Still",
        "order": 3,
        "isPublished": true,
        "createdAt": "2026-09-25T03:52:54.159Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugfdqjc000oakxysx3dcnpj",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790308373982-dgm3i6.png",
        "category": "Still",
        "order": 4,
        "isPublished": true,
        "createdAt": "2026-09-25T03:52:54.168Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugfdqjh000pakxyxlpii1xh",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790308374105-crorg9.png",
        "category": "Still",
        "order": 5,
        "isPublished": true,
        "createdAt": "2026-09-25T03:52:54.173Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    },
    {
        "id": "cmugfeq84000qakxy2h5f4fi5",
        "title": "HIGH - FERNANDES",
        "subtitle": null,
        "imageUrl": "/uploads/1790308420349-oy1t8v.png",
        "category": "Still",
        "order": 6,
        "isPublished": true,
        "createdAt": "2026-09-25T03:53:40.420Z",
        "updatedAt": "2026-09-25T04:17:56.425Z"
    }
];
  for (const ph of photos) {
    await prisma.photo.upsert({
      where: { id: ph.id },
      update: {
        title: ph.title,
        subtitle: ph.subtitle,
        imageUrl: ph.imageUrl,
        category: ph.category,
        order: ph.order,
        isPublished: ph.isPublished,
      },
      create: {
        id: ph.id,
        title: ph.title,
        subtitle: ph.subtitle,
        imageUrl: ph.imageUrl,
        category: ph.category,
        order: ph.order,
        isPublished: ph.isPublished,
      },
    });
  }
  console.log("Seeded " + photos.length + " photos.");

  console.log("Database seeding finished successfully.");
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
