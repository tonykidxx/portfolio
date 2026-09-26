# Candy Machine Studios — Portfólio Cinematográfico Full-Stack

Aplicação web completa para exibição e gerenciamento de portfólio audiovisual, desenvolvida com **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM (PostgreSQL)** e **NextAuth.js**.

---

## 🚀 Funcionalidades

### 1. Landing Page Pública (`/`)
- **Imersão Total:** Interface escura e cinematográfica baseada rigorosamente no Design System da marca (inspiração Netflix Spain).
- **Hero Section Dinâmico:** Destaque para o vídeo principal com botão de reprodução direta e informações do projeto.
- **Carrosséis por Categoria:** Exibição horizontal organizada de projetos (Comerciais, Videoclipes, Documentários, etc.).
- **Suporte a Mídia Vertical & Horizontal:** Containers responsivos de 16:9 e 9:16 (Stories/Reels/TikTok).
- **Player Modal:** Visualizador de vídeo integrado com navegação acessível por teclado (ESC).

### 2. Painel Administrativo Protegido (`/admin`)
- **Autenticação Segura:** Proteção por servidor via NextAuth com hash `bcryptjs` de senhas.
- **Gerenciamento de Projetos:** Criar, editar, excluir, alterar thumbnail/vídeo, alternar visibilidade (Publicado/Oculto) e definir destaque Hero.
- **Gerenciamento de Categorias:** Criar, renomear e excluir seções da Landing Page.
- **Configurações do Site:** Editar nome do estúdio, títulos do hero e contatos sem alterar o código.
- **Upload de Mídia:** Upload direto de vídeos e imagens para armazenamento local (`/public/uploads`) com suporte a URLs externas.

---

## 🛠 Stack Tecnológica

- **Framework:** Next.js (App Router) + React + TypeScript
- **Estilização:** Tailwind CSS v4 (Design System tokens em `app/globals.css`)
- **Banco de Dados:** PostgreSQL (Neon) via Prisma ORM
- **Autenticação:** NextAuth.js (Session JWT + Credentials Provider)
- **Ícones:** Lucide React

---

## 💻 Instalação e Execução Local

### Próximos passos para rodar localmente:

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar o banco de dados:**
   ```bash
   npx prisma db push
   ```

3. **Popular o banco com o Admin inicial e projetos de exemplo:**
   ```bash
   npx tsx prisma/seed.ts
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Credenciais do Admin Inicial

Após executar o comando de seed (`npx tsx prisma/seed.ts`), utilize os dados abaixo para acessar o painel em `http://localhost:3000/login`:

- **Email:** `admin@candymachine.com`
- **Senha:** `admin123`

---

## 📁 Estrutura de Pastas Principal

```
portfolio/
├── actions/             # Server Actions (CRUD de projetos, categorias e configurações)
├── app/                 # Next.js App Router (Landing page, Admin, Login, APIs)
│   ├── (public)/        # Rota pública principal
│   ├── admin/           # Rotas administrativas protegidas
│   ├── api/             # Endpoints NextAuth e Upload de arquivos
│   └── login/           # Tela de autenticação
├── components/          # Componentes UI (Navbar, Hero, ProjectCard, VideoModal, AdminSidebar, etc)
├── docs/                # Arquivos de referência e Design System oficial
├── lib/                 # Utilitários (Prisma Client singleton, NextAuth config)
├── prisma/              # Schema do banco de dados e script de seed
└── public/uploads/      # Armazenamento local de mídias enviadas pelo Admin
```
