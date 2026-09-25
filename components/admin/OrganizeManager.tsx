"use client";

import { useState } from "react";
import { reorderPageSections } from "@/actions/category-actions";
import { reorderProjects } from "@/actions/project-actions";
import { reorderClients } from "@/actions/client-actions";
import { reorderPhotos } from "@/actions/photo-actions";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  MoveLeft,
  MoveRight,
  Check,
  FolderTree,
  Film,
  Camera,
  Users,
  Sparkles,
  Loader2,
  ExternalLink,
  Briefcase,
  Send,
} from "lucide-react";
import { getYouTubeId, getRandomYouTubeFrame } from "@/lib/video-utils";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  videoUrl: string;
  thumbUrl?: string | null;
  isVertical: boolean;
  order: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  order: number;
  projects: Project[];
}

interface ClientItem {
  id: string;
  name: string;
  followers: string;
  imageUrl: string;
  role?: string | null;
  order: number;
}

interface StillItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  order: number;
  isPublished: boolean;
}

export interface PageSectionItem {
  id: string;
  type: "category" | "clients" | "photos" | "services" | "about" | "cta";
  name: string;
  order: number;
  count: number;
}

interface OrganizeManagerProps {
  initialCategories: Category[];
  initialClients?: ClientItem[];
  initialStills?: StillItem[];
  initialClientsOrder?: number;
  initialPhotosOrder?: number;
  initialPhotosCount?: number;
  initialPhotosTitle?: string;
  initialServicesOrder?: number;
  initialAboutOrder?: number;
  initialCtaOrder?: number;
  defaultTab?: "sections" | "videos" | "clients" | "stills";
}

export function OrganizeManager({
  initialCategories,
  initialClients = [],
  initialStills = [],
  initialClientsOrder = 0,
  initialPhotosOrder = 88,
  initialPhotosCount = 0,
  initialPhotosTitle = "Stills",
  initialServicesOrder = 90,
  initialAboutOrder = 91,
  initialCtaOrder = 92,
  defaultTab = "sections",
}: OrganizeManagerProps) {
  const [tab, setTab] = useState<"sections" | "videos" | "clients" | "stills">(defaultTab);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [stills, setStills] = useState<StillItem[]>(initialStills);

  // Monta lista unificada de todas as seções da página inicial
  const initialSections: PageSectionItem[] = [
    {
      id: "clients-section",
      type: "clients" as const,
      name: "Clientes & Creators (Destaques)",
      order: initialClientsOrder,
      count: initialClients.length,
    },
    {
      id: "photos-section",
      type: "photos" as const,
      name: initialPhotosTitle || "Stills",
      order: initialPhotosOrder,
      count: initialPhotosCount,
    },
    {
      id: "services-section",
      type: "services" as const,
      name: "O Que Fazemos (Direção Criativa, Videoclipes, etc.)",
      order: initialServicesOrder,
      count: 4,
    },
    {
      id: "about-section",
      type: "about" as const,
      name: "Manifesto / Sobre (Imagem com Intenção...)",
      order: initialAboutOrder,
      count: 4,
    },
    {
      id: "cta-section",
      type: "cta" as const,
      name: "Novo Projeto / CTA (Vamos criar alguma coisa...)",
      order: initialCtaOrder,
      count: 2,
    },
    ...initialCategories.map((c) => ({
      id: c.id,
      type: "category" as const,
      name: c.name,
      order: c.order,
      count: c.projects?.length || 0,
    })),
  ].sort((a, b) => a.order - b.order);

  const [sections, setSections] = useState<PageSectionItem[]>(initialSections);

  const [selectedCatId, setSelectedCatId] = useState<string>(
    initialCategories[0]?.id || ""
  );

  // Estados de Drag & Drop para Seções
  const [dragSectionIndex, setDragSectionIndex] = useState<number | null>(null);
  const [dropSectionIndex, setDropSectionIndex] = useState<number | null>(null);

  // Estados de Drag & Drop para Vídeos
  const [dragVideoIndex, setDragVideoIndex] = useState<number | null>(null);
  const [dropVideoIndex, setDropVideoIndex] = useState<number | null>(null);

  // Estados de Drag & Drop para Clientes
  const [dragClientIndex, setDragClientIndex] = useState<number | null>(null);
  const [dropClientIndex, setDropClientIndex] = useState<number | null>(null);

  // Estados de Drag & Drop para Stills / Frames
  const [dragStillIndex, setDragStillIndex] = useState<number | null>(null);
  const [dropStillIndex, setDropStillIndex] = useState<number | null>(null);

  // Status de salvamento
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  // --- REORDENAÇÃO DE SEÇÕES DA PÁGINA (CATEGORIAS + CLIENTES) ---
  const persistSections = async (updatedList: PageSectionItem[]) => {
    setSaving(true);
    try {
      const payload = updatedList.map((item, idx) => ({
        id: item.id,
        type: item.type,
        order: idx + 1,
      }));
      await reorderPageSections(payload);
      showNotification("Ordem das seções salva no site!");
    } catch (err: any) {
      alert("Erro ao salvar ordem das seções: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sections.length || fromIdx === toIdx) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(updated);
    await persistSections(updated);
  };

  const handleSectionDrop = async (targetIdx: number) => {
    if (dragSectionIndex === null || dragSectionIndex === targetIdx) {
      setDragSectionIndex(null);
      setDropSectionIndex(null);
      return;
    }
    await moveSection(dragSectionIndex, targetIdx);
    setDragSectionIndex(null);
    setDropSectionIndex(null);
  };

  // --- REORDENAÇÃO DE VÍDEOS ---
  const currentCategory = categories.find((c) => c.id === selectedCatId) || categories[0];
  const currentProjects = currentCategory?.projects || [];

  const persistProjects = async (catId: string, updatedProjects: Project[]) => {
    setSaving(true);
    try {
      const payload = updatedProjects.map((p, idx) => ({
        id: p.id,
        order: idx + 1,
        categoryId: catId,
      }));
      await reorderProjects(payload);

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === catId ? { ...cat, projects: updatedProjects } : cat
        )
      );
      showNotification("Ordem dos vídeos atualizada no site!");
    } catch (err: any) {
      alert("Erro ao salvar ordem dos vídeos: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveVideo = async (fromIdx: number, toIdx: number) => {
    if (!currentCategory) return;
    if (toIdx < 0 || toIdx >= currentProjects.length || fromIdx === toIdx) return;
    const reordered = [...currentProjects];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((p, idx) => ({ ...p, order: idx + 1 }));
    await persistProjects(currentCategory.id, updated);
  };

  const handleVideoDrop = async (targetIdx: number) => {
    if (dragVideoIndex === null || dragVideoIndex === targetIdx) {
      setDragVideoIndex(null);
      setDropVideoIndex(null);
      return;
    }
    await moveVideo(dragVideoIndex, targetIdx);
    setDragVideoIndex(null);
    setDropVideoIndex(null);
  };

  // --- REORDENAÇÃO DE CLIENTES & CREATORS ---
  const persistClients = async (updatedList: ClientItem[]) => {
    setSaving(true);
    try {
      const payload = updatedList.map((c, idx) => ({
        id: c.id,
        order: idx + 1,
      }));
      await reorderClients(payload);
      showNotification("Ordem dos clientes salva no site!");
    } catch (err: any) {
      alert("Erro ao salvar ordem dos clientes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveClient = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= clients.length || fromIdx === toIdx) return;
    const reordered = [...clients];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((c, idx) => ({ ...c, order: idx + 1 }));
    setClients(updated);
    await persistClients(updated);
  };

  const handleClientDrop = async (targetIdx: number) => {
    if (dragClientIndex === null || dragClientIndex === targetIdx) {
      setDragClientIndex(null);
      setDropClientIndex(null);
      return;
    }
    await moveClient(dragClientIndex, targetIdx);
    setDragClientIndex(null);
    setDropClientIndex(null);
  };

  // --- REORDENAÇÃO DE STILLS / FRAMES ---
  const persistStills = async (updatedList: StillItem[]) => {
    setSaving(true);
    try {
      const payload = updatedList.map((s, idx) => ({
        id: s.id,
        order: idx,
      }));
      await reorderPhotos(payload);
      showNotification("Ordem das stills salva no site!");
    } catch (err: any) {
      alert("Erro ao salvar ordem das stills: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveStill = async (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= stills.length || fromIdx === toIdx) return;
    const reordered = [...stills];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, order: idx }));
    setStills(updated);
    await persistStills(updated);
  };

  const handleStillDrop = async (targetIdx: number) => {
    if (dragStillIndex === null || dragStillIndex === targetIdx) {
      setDragStillIndex(null);
      setDropStillIndex(null);
      return;
    }
    await moveStill(dragStillIndex, targetIdx);
    setDragStillIndex(null);
    setDropStillIndex(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Organizar Ordem</span>
            <span className="text-xs bg-[#e50914] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Drag & Drop
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Clique e arraste os itens para definir a posição exata de cada elemento na Landing Page.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          {saving && (
            <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-gray-300">
              <Loader2 size={14} className="animate-spin text-[#e50914]" />
              <span>Salvando alterações...</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg animate-fade-in">
              <Check size={14} className="text-emerald-400" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/10"
          >
            <span>Ver no Site</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2 flex-wrap">
        <button
          onClick={() => setTab("sections")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            tab === "sections"
              ? "border-[#e50914] text-white bg-[#e50914]/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <FolderTree size={18} />
          <span>1. Seções da Página ({sections.length})</span>
        </button>

        <button
          onClick={() => setTab("videos")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            tab === "videos"
              ? "border-[#e50914] text-white bg-[#e50914]/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Film size={18} />
          <span>2. Ordem dos Vídeos</span>
        </button>

        <button
          onClick={() => setTab("clients")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            tab === "clients"
              ? "border-[#e50914] text-white bg-[#e50914]/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Users size={18} />
          <span>3. Ordem dos Clientes ({clients.length})</span>
        </button>

        <button
          onClick={() => setTab("stills")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
            tab === "stills"
              ? "border-[#e50914] text-white bg-[#e50914]/10 rounded-t-lg"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Camera size={18} />
          <span>4. Ordem das Stills ({stills.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDEM DAS SEÇÕES DA PÁGINA (INCLUINDO CLIENTES) */}
      {tab === "sections" && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>
                Posicione onde você quiser: arraste seções como <strong>{initialPhotosTitle || "Stills"}</strong>, <strong>Clientes & Creators</strong>, <strong>O Que Fazemos</strong>, <strong>Sobre</strong> para cima ou para baixo para definir a ordem exata na Landing Page.
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => {
              const isDragging = dragSectionIndex === idx;
              const isDropTarget = dropSectionIndex === idx;
              const isClients = sec.type === "clients";
              const isPhotos = sec.type === "photos";
              const isServices = sec.type === "services";
              const isAbout = sec.type === "about";
              const isCta = sec.type === "cta";

              let badgeColor = "bg-black/60 border border-white/10 text-gray-300";
              let rowBorderBg = "bg-[#141414] border-white/10 hover:border-white/25 hover:bg-[#181818]";
              let icon = <FolderTree size={15} />;
              let iconBg = "bg-white/5 text-gray-400";
              let tag = null;
              let desc = `${sec.count} vídeos cadastrados nesta seção`;

              if (isClients) {
                badgeColor = "bg-purple-900/60 border border-purple-500/40 text-purple-200";
                rowBorderBg = "bg-[#1f1627] border-purple-500/30 hover:border-purple-500/60 hover:bg-[#251b30]";
                icon = <Users size={15} />;
                iconBg = "bg-purple-500/20 text-purple-400";
                tag = <span className="bg-purple-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">CLIENTES & CREATORS</span>;
                desc = `${sec.count} clientes/creators em exibição horizontal`;
              } else if (isPhotos) {
                badgeColor = "bg-rose-900/60 border border-rose-500/40 text-rose-200";
                rowBorderBg = "bg-[#251419] border-rose-500/30 hover:border-rose-500/60 hover:bg-[#301a20]";
                icon = <Camera size={15} />;
                iconBg = "bg-rose-500/20 text-rose-400";
                tag = <span className="bg-rose-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">SEÇÃO DE STILLS</span>;
                desc = `${sec.count} frames/stills cadastrados em carrossel horizontal`;
              } else if (isServices) {
                badgeColor = "bg-blue-900/60 border border-blue-500/40 text-blue-200";
                rowBorderBg = "bg-[#131f2f] border-blue-500/30 hover:border-blue-500/60 hover:bg-[#17273b]";
                icon = <Briefcase size={15} />;
                iconBg = "bg-blue-500/20 text-blue-400";
                tag = <span className="bg-blue-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">O QUE FAZEMOS</span>;
                desc = "4 blocos de serviços (Direção Criativa, Videoclipes, Conteúdo, Pós & VFX)";
              } else if (isAbout) {
                badgeColor = "bg-amber-900/60 border border-amber-500/40 text-amber-200";
                rowBorderBg = "bg-[#251b14] border-amber-500/30 hover:border-amber-500/60 hover:bg-[#2f2219]";
                icon = <Sparkles size={15} />;
                iconBg = "bg-amber-500/20 text-amber-400";
                tag = <span className="bg-amber-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">MANIFESTO / SOBRE</span>;
                desc = "Texto de manifesto + 4 especialidades (Audiovisual, Social, Creative, Post)";
              } else if (isCta) {
                badgeColor = "bg-emerald-900/60 border border-emerald-500/40 text-emerald-200";
                rowBorderBg = "bg-[#13251c] border-emerald-500/30 hover:border-emerald-500/60 hover:bg-[#172e23]";
                icon = <Send size={15} />;
                iconBg = "bg-emerald-500/20 text-emerald-400";
                tag = <span className="bg-emerald-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">NOVO PROJETO (CTA)</span>;
                desc = "Chamada final para contato com botões de WhatsApp e Instagram";
              }

              return (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={(e) => {
                    setDragSectionIndex(idx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dropSectionIndex !== idx) {
                      setDropSectionIndex(idx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dropSectionIndex === idx) {
                      setDropSectionIndex(null);
                    }
                  }}
                  onDrop={() => handleSectionDrop(idx)}
                  onDragEnd={() => {
                    setDragSectionIndex(null);
                    setDropSectionIndex(null);
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 select-none ${
                    isDragging
                      ? "opacity-30 bg-gray-800 border-dashed border-[#e50914] scale-[0.99]"
                      : isDropTarget
                      ? "bg-[#e50914]/15 border-[#e50914] shadow-lg shadow-red-950/40"
                      : rowBorderBg
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1.5 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                      title="Clique e arraste para mudar a ordem"
                    >
                      <GripVertical size={20} />
                    </div>

                    {/* Position Badge */}
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${badgeColor}`}
                    >
                      #{idx + 1}
                    </span>

                    {/* Section Title & Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`p-1 rounded ${iconBg}`}>
                          {icon}
                        </span>
                        <h3 className="font-bold text-white text-base">
                          {sec.name}
                        </h3>
                        {tag}
                        {isPhotos && (
                          <Link
                            href="/admin/stills"
                            className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-semibold ml-1"
                            title="Gerenciar frames e personalizar título"
                          >
                            <span>Personalizar Título & Frames</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                        {isClients && (
                          <Link
                            href="/admin/clients"
                            className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 font-semibold ml-1"
                            title="Gerenciar clientes"
                          >
                            <span>Gerenciar Clientes</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Accessible Up-Down Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, idx - 1)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, idx + 1)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ORDEM DOS VÍDEOS */}
      {tab === "videos" && (
        <div className="space-y-6">
          {/* Category Selector Bar */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Selecione a Seção para Organizar os Vídeos:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCatId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#e50914] text-white shadow-lg shadow-red-950/30 scale-102"
                        : "bg-[#222] text-gray-300 hover:text-white hover:bg-[#333] border border-white/5"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-black/40 text-white" : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {cat.projects?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Videos Reorder Area */}
          <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Vídeos de: <span className="text-[#e50914]">{currentCategory?.name}</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Arraste os vídeos para mudar a ordem em que aparecem no carrossel.
                </p>
              </div>
              <span className="text-xs text-gray-400">
                Total de {currentProjects.length} vídeos
              </span>
            </div>

            {currentProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500 space-y-2">
                <p>Nenhum vídeo cadastrado nesta categoria ainda.</p>
                <Link
                  href="/admin/projects/new"
                  className="inline-block text-xs text-[#e50914] hover:underline font-semibold"
                >
                  + Cadastrar Novo Vídeo
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProjects.map((project, idx) => {
                  const isDragging = dragVideoIndex === idx;
                  const isDropTarget = dropVideoIndex === idx;
                  const ytId = getYouTubeId(project.videoUrl);
                  const thumb =
                    project.thumbUrl ||
                    (ytId ? getRandomYouTubeFrame(project.videoUrl, project.id || project.title) : null);

                  return (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => {
                        setDragVideoIndex(idx);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dropVideoIndex !== idx) {
                          setDropVideoIndex(idx);
                        }
                      }}
                      onDragLeave={() => {
                        if (dropVideoIndex === idx) {
                          setDropVideoIndex(null);
                        }
                      }}
                      onDrop={() => handleVideoDrop(idx)}
                      onDragEnd={() => {
                        setDragVideoIndex(null);
                        setDropVideoIndex(null);
                      }}
                      className={`group relative rounded-xl border overflow-hidden flex flex-col justify-between transition-all select-none cursor-grab active:cursor-grabbing ${
                        isDragging
                          ? "opacity-30 bg-gray-900 border-dashed border-[#e50914] scale-[0.98]"
                          : isDropTarget
                          ? "bg-[#e50914]/20 border-[#e50914] shadow-xl shadow-red-950/50 scale-[1.02]"
                          : "bg-[#1c1c1c] border-white/10 hover:border-white/30 hover:shadow-lg"
                      }`}
                    >
                      <div className="relative aspect-[16/9] bg-black overflow-hidden">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={project.title}
                            className="w-full h-full object-cover pointer-events-none"
                            loading="lazy"
                          />
                        ) : (
                          <video
                            src={`${project.videoUrl}#t=1`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        )}

                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white font-mono font-bold text-xs px-2 py-1 rounded border border-white/20 shadow">
                          #{idx + 1}
                        </div>

                        <div className="absolute top-2 right-2">
                          {project.isVertical ? (
                            <span className="bg-purple-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              9:16
                            </span>
                          ) : (
                            <span className="bg-blue-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              16:9
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="text-[11px] text-gray-300 flex items-center gap-1">
                            <GripVertical size={14} className="text-gray-400" />
                            Arraste para mover
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">
                            {project.title}
                          </h4>
                          <span className="text-[11px] text-gray-400">
                            Posição: {idx + 1}º
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveVideo(idx, idx - 1);
                            }}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Mover para trás"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === currentProjects.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveVideo(idx, idx + 1);
                            }}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Mover para frente"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDEM DOS CLIENTES & CREATORS */}
      {tab === "clients" && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>
                Arraste as bolinhas de clientes para definir quem aparece em 1º, 2º, 3º lugar no carrossel de destaques da página inicial.
              </span>
            </div>
            <Link
              href="/admin/clients"
              className="text-xs text-[#e50914] hover:underline font-semibold shrink-0"
            >
              + Gerenciar Clientes
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map((client, idx) => {
              const isDragging = dragClientIndex === idx;
              const isDropTarget = dropClientIndex === idx;

              return (
                <div
                  key={client.id}
                  draggable
                  onDragStart={(e) => {
                    setDragClientIndex(idx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dropClientIndex !== idx) {
                      setDropClientIndex(idx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dropClientIndex === idx) {
                      setDropClientIndex(null);
                    }
                  }}
                  onDrop={() => handleClientDrop(idx)}
                  onDragEnd={() => {
                    setDragClientIndex(null);
                    setDropClientIndex(null);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                    isDragging
                      ? "opacity-30 bg-gray-900 border-dashed border-[#e50914] scale-[0.98]"
                      : isDropTarget
                      ? "bg-[#e50914]/20 border-[#e50914] shadow-xl shadow-red-950/50 scale-[1.02]"
                      : "bg-[#141414] border-white/10 hover:border-white/30 hover:bg-[#181818]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white p-1">
                      <GripVertical size={18} />
                    </div>

                    <span className="w-7 h-7 rounded-md bg-black/60 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-gray-300 shrink-0">
                      #{idx + 1}
                    </span>

                    {/* Client Avatar Circular */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-white/10 shrink-0">
                      <img
                        src={client.imageUrl}
                        alt={client.name}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">
                        {client.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {client.followers}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveClient(idx, idx - 1)}
                      className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Mover para trás"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === clients.length - 1}
                      onClick={() => moveClient(idx, idx + 1)}
                      className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Mover para frente"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ORDEM DAS STILLS / FRAMES ENTRE SI */}
      {tab === "stills" && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>
                Arraste os frames para definir a ordem exata em que aparecem lado a lado no carrossel de <strong>{initialPhotosTitle || "Stills"}</strong> na página inicial.
              </span>
            </div>
            <Link
              href="/admin/stills"
              className="text-xs text-[#e50914] hover:underline font-semibold shrink-0"
            >
              + Gerenciar / Adicionar Frames
            </Link>
          </div>

          {stills.length === 0 ? (
            <div className="bg-[#141414] border border-white/10 p-12 rounded-xl text-center space-y-3">
              <Camera size={32} className="mx-auto text-gray-500" />
              <p className="text-gray-300 font-semibold text-sm">Nenhum frame cadastrado ainda.</p>
              <Link
                href="/admin/stills"
                className="inline-block text-xs text-[#e50914] hover:underline font-semibold"
              >
                + Cadastrar Novos Frames
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stills.map((still, idx) => {
                const isDragging = dragStillIndex === idx;
                const isDropTarget = dropStillIndex === idx;

                return (
                  <div
                    key={still.id}
                    draggable
                    onDragStart={(e) => {
                      setDragStillIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dropStillIndex !== idx) {
                        setDropStillIndex(idx);
                      }
                    }}
                    onDragLeave={() => {
                      if (dropStillIndex === idx) {
                        setDropStillIndex(null);
                      }
                    }}
                    onDrop={() => handleStillDrop(idx)}
                    onDragEnd={() => {
                      setDragStillIndex(null);
                      setDropStillIndex(null);
                    }}
                    className={`group relative rounded-xl border overflow-hidden flex flex-col justify-between transition-all select-none cursor-grab active:cursor-grabbing ${
                      isDragging
                        ? "opacity-30 bg-gray-900 border-dashed border-[#e50914] scale-[0.98]"
                        : isDropTarget
                        ? "bg-[#e50914]/20 border-[#e50914] shadow-xl shadow-red-950/50 scale-[1.02]"
                        : "bg-[#181818] border-white/10 hover:border-white/30 hover:shadow-lg"
                    }`}
                  >
                    <div className="relative aspect-[16/9] bg-black overflow-hidden">
                      <img
                        src={still.imageUrl}
                        alt={still.title || "Frame"}
                        className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Position Badge */}
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white font-mono font-bold text-xs px-2.5 py-1 rounded border border-white/20 shadow">
                        #{idx + 1}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] text-gray-300 flex items-center gap-1">
                          <GripVertical size={14} className="text-gray-400" />
                          Arraste para mover
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate uppercase font-sans">
                          {still.title || "Sem título"}
                        </h4>
                        <span className="text-[11px] text-gray-400">
                          Posição no carrossel: {idx + 1}º
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStill(idx, idx - 1);
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Mover para esquerda (aparece antes)"
                        >
                          <MoveLeft size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === stills.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStill(idx, idx + 1);
                          }}
                          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                          title="Mover para direita (aparece depois)"
                        >
                          <MoveRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
