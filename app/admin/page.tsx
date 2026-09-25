import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Film, FolderTree, Eye, Star, Plus, Users } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const totalProjects = await prisma.project.count();
  const publishedProjects = await prisma.project.count({ where: { isPublished: true } });
  const totalCategories = await prisma.category.count();
  const totalClients = await prisma.client.count();
  const heroProject = await prisma.project.findFirst({ where: { isHero: true } });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Visão geral do conteúdo do seu portfólio.</p>
        </div>

        <Link
          href="/admin/projects/new"
          className="flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Novo Projeto</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Total de Projetos</span>
            <Film size={20} className="text-[#e50914]" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalProjects}</p>
        </div>

        <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Publicados no Site</span>
            <Eye size={20} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{publishedProjects}</p>
        </div>

        <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Bolinhas de Clientes</span>
            <Users size={20} className="text-[#ff4d4d]" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalClients}</p>
        </div>

        <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-sm font-medium">Categorias</span>
            <FolderTree size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-white">{totalCategories}</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/projects"
            className="p-4 bg-[#222] hover:bg-[#2b2b2b] border border-white/5 rounded-lg transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center gap-3 text-white font-semibold">
              <Film size={20} className="text-[#e50914]" />
              <span>Gerenciar Projetos</span>
            </div>
            <p className="text-xs text-gray-400">
              Vídeos em 16:9 ou 9:16, capas e visibilidade.
            </p>
          </Link>

          <Link
            href="/admin/clients"
            className="p-4 bg-[#222] hover:bg-[#2b2b2b] border border-white/5 rounded-lg transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center gap-3 text-white font-semibold">
              <Users size={20} className="text-[#ff4d4d]" />
              <span>Clientes & Creators</span>
            </div>
            <p className="text-xs text-gray-400">
              Adicione fotos circulares (bolinhas), nomes e seguidores.
            </p>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 bg-[#222] hover:bg-[#2b2b2b] border border-white/5 rounded-lg transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center gap-3 text-white font-semibold">
              <FolderTree size={20} className="text-blue-500" />
              <span>Gerenciar Categorias</span>
            </div>
            <p className="text-xs text-gray-400">
              Crie novas seções (Comerciais, Clipes, etc).
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 bg-[#222] hover:bg-[#2b2b2b] border border-white/5 rounded-lg transition-colors flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center gap-3 text-white font-semibold">
              <Star size={20} className="text-amber-400" />
              <span>Configurações</span>
            </div>
            <p className="text-xs text-gray-400">
              Nome do estúdio, textos e informações de contato.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
