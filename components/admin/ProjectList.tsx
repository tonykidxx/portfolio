"use client";

import { useState } from "react";
import Link from "next/link";
import {
  deleteProject,
  setHeroProject,
  updateProject,
} from "@/actions/project-actions";
import {
  Edit2,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Play,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  Crop,
} from "lucide-react";
import { getYouTubeId, getRandomYouTubeFrame, getYouTubeThumbnail } from "@/lib/video-utils";
import { ThumbnailAdjusterModal } from "./ThumbnailAdjusterModal";

interface Project {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbUrl?: string | null;
  isVertical: boolean;
  isHero: boolean;
  isPublished: boolean;
  order: number;
  category: { id: string; name: string };
}

export function ProjectList({
  initialProjects,
  isPresentationActive = false,
}: {
  initialProjects: Project[];
  isPresentationActive?: boolean;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adjustingProject, setAdjustingProject] = useState<Project | null>(null);

  const handleTogglePublished = async (project: Project) => {
    const nextPublished = !project.isPublished;
    try {
      await updateProject(project.id, { isPublished: nextPublished });
      setProjects(
        projects.map((p) =>
          p.id === project.id ? { ...p, isPublished: nextPublished } : p
        )
      );
    } catch (err: any) {
      alert("Erro ao alterar visibilidade.");
    }
  };

  const handleSetHero = async (id: string) => {
    try {
      await setHeroProject(id);
      setProjects(
        projects.map((p) => ({
          ...p,
          isHero: p.id === id,
        }))
      );
    } catch (err: any) {
      alert("Erro ao definir destaque.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProject(deleteId);
      setProjects(projects.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert("Erro ao excluir projeto.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span className="text-sm text-gray-400">
          Total de {projects.length} projetos cadastrados
        </span>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/organize?tab=videos"
            className="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-gray-200 hover:text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow"
          >
            <ArrowUpDown size={16} className="text-[#e50914]" />
            <span>Organizar Ordem (Drag & Drop)</span>
          </Link>

          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg cursor-pointer"
          >
            <Plus size={18} />
            <span>Novo Projeto</span>
          </Link>
        </div>
      </div>

      {/* Banner de Aviso quando Vídeo de Apresentação está Ativo */}
      {isPresentationActive && (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-emerald-300">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span>
              <strong>Vídeo de Apresentação ATIVO na Home:</strong> O vídeo institucional configurado está assumindo o topo da página inicial e tem prioridade sobre o projeto com estrela Hero.
            </span>
          </div>
          <Link
            href="/admin/presentation"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-semibold transition-colors shrink-0 text-xs text-center"
          >
            Gerenciar Vídeo de Apresentação
          </Link>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 p-12 rounded-xl text-center space-y-3">
          <p className="text-gray-300 font-medium text-lg">
            Nenhum projeto cadastrado ainda.
          </p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Clique no botão acima para adicionar seu primeiro vídeo ao portfólio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all"
            >
              {/* Media Preview Header - Quadro do próprio vídeo anexado */}
              {(() => {
                const ytId = getYouTubeId(project.videoUrl);
                const displayThumb = project.thumbUrl || (ytId ? getRandomYouTubeFrame(project.videoUrl, project.id || project.title) : null);
                return (
                  <div className="relative w-full aspect-[16/9] bg-black overflow-hidden">
                    {displayThumb ? (
                      <img
                        src={displayThumb}
                        alt={project.title}
                        onError={(e) => {
                          if (ytId) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : project.videoUrl ? (
                      <video
                        src={`${project.videoUrl}#t=1`}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#141414]" />
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                        {project.category.name}
                      </span>
                      {project.isVertical ? (
                        <span className="bg-purple-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                          9:16 Vertical
                        </span>
                      ) : (
                        <span className="bg-blue-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow">
                          16:9 Horizontal
                        </span>
                      )}
                    </div>

                    {/* Hero Badge */}
                    {project.isHero && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-black font-extrabold text-xs px-2.5 py-1 rounded flex items-center gap-1 shadow-lg">
                        <Star size={14} fill="black" />
                        <span>HERO</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Body Content */}
              <div className="p-5 space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-white text-base line-clamp-1">
                    {project.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      project.isPublished
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {project.isPublished ? "Publicado" : "Oculto"}
                  </span>
                </div>

                {project.description && (
                  <p className="text-gray-400 text-xs line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-[#1c1c1c] border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {/* Hero Star Button */}
                  <button
                    onClick={() => handleSetHero(project.id)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      project.isHero
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-gray-400 hover:text-amber-400 hover:bg-white/5"
                    }`}
                    title={project.isHero ? "Destaque Principal Atual" : "Definir como Destaque Hero"}
                  >
                    <Star size={18} fill={project.isHero ? "currentColor" : "none"} />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => handleTogglePublished(project)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      project.isPublished
                        ? "text-emerald-400 hover:bg-emerald-400/10"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                    title={project.isPublished ? "Ocultar do Site" : "Publicar no Site"}
                  >
                    {project.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {/* Adjust Thumbnail Button */}
                  <button
                    onClick={() => setAdjustingProject(project)}
                    className="p-2 text-gray-400 hover:text-[#e50914] hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Ajustar Thumbnail & Remover Tarjas Pretas"
                  >
                    <Crop size={18} />
                  </button>

                  {/* Edit Link */}
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar Projeto"
                  >
                    <Edit2 size={18} />
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => setDeleteId(project.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Projeto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-md w-full space-y-5">
            <div className="flex items-center gap-3 text-red-500 font-bold text-lg">
              <AlertTriangle size={24} />
              <span>Confirmar Exclusão</span>
            </div>
            <p className="text-gray-300 text-sm">
              Tem certeza que deseja excluir este projeto? Esta ação removerá o vídeo e suas informações do banco de dados permanentemente.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-[#e50914] hover:bg-[#f6121d] text-white text-sm font-semibold rounded-md cursor-pointer"
              >
                Excluir Projeto
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Ajuste de Thumbnail / Remoção de Tarjas Pretas */}
      {adjustingProject && (
        <ThumbnailAdjusterModal
          isOpen={!!adjustingProject}
          onClose={() => setAdjustingProject(null)}
          imageUrl={
            adjustingProject.thumbUrl ||
            getYouTubeThumbnail(adjustingProject.videoUrl) ||
            getRandomYouTubeFrame(adjustingProject.videoUrl, adjustingProject.id) ||
            ""
          }
          projectTitle={adjustingProject.title}
          isVertical={adjustingProject.isVertical}
          onSave={async (newUrl) => {
            try {
              await updateProject(adjustingProject.id, { thumbUrl: newUrl });
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === adjustingProject.id ? { ...p, thumbUrl: newUrl } : p
                )
              );
              setAdjustingProject(null);
            } catch (err: any) {
              alert("Erro ao salvar thumbnail no banco de dados.");
            }
          }}
        />
      )}
    </div>
  );
}
