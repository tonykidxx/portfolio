"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  createPhoto,
  createMultiplePhotos,
  updatePhoto,
  deletePhoto,
  reorderPhotos,
  togglePhotoPublished,
  updateStillsSectionTitle,
} from "@/actions/photo-actions";
import {
  Film,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  MoveLeft,
  MoveRight,
  Loader2,
  Check,
  X,
  AlertTriangle,
  ImageIcon,
  ArrowUpDown,
  ExternalLink,
  GripVertical,
} from "lucide-react";

interface StillItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  order: number;
  isPublished: boolean;
}

interface StillsManagerProps {
  initialStills: StillItem[];
  initialSectionTitle?: string;
}

export function StillsManager({
  initialStills = [],
  initialSectionTitle = "Stills",
}: StillsManagerProps) {
  const [stills, setStills] = useState<StillItem[]>(initialStills);
  const [sectionTitle, setSectionTitle] = useState(initialSectionTitle || "Stills");
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleSavedSuccess, setTitleSavedSuccess] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Salvar título personalizado da seção
  const handleSaveSectionTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sectionTitle.trim()) return;

    setSavingTitle(true);
    try {
      await updateStillsSectionTitle(sectionTitle.trim());
      setTitleSavedSuccess(true);
      setTimeout(() => setTitleSavedSuccess(false), 3500);
    } catch (err: any) {
      alert("Erro ao salvar título da seção: " + (err.message || "Erro desconhecido"));
    } finally {
      setSavingTitle(false);
    }
  };

  // Upload de arquivos (suporta múltiplos arquivos selecionados)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const newStills = await createMultiplePhotos(
          uploadedUrls.map((url) => ({
            imageUrl: url,
            title: titleInput.trim() || undefined,
            category: "Still",
          }))
        );

        setStills((prev) => [...prev, ...(newStills as any[])]);
        setTitleInput("");
      }
    } catch (err: any) {
      alert("Erro ao enviar arquivos de stills.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Adicionar por URL direta
  const handleAddByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setUploading(true);
    try {
      const created = await createPhoto({
        imageUrl: urlInput.trim(),
        title: titleInput.trim() || undefined,
        category: "Still",
      });
      setStills([...stills, created as any]);
      setUrlInput("");
      setTitleInput("");
    } catch (err: any) {
      alert(err.message || "Erro ao adicionar frame.");
    } finally {
      setUploading(false);
    }
  };

  // Salvar título editado
  const handleSaveTitle = async (id: string) => {
    try {
      await updatePhoto(id, { title: editingTitle.trim() || null });
      setStills(
        stills.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() || null } : s))
      );
      setEditingId(null);
    } catch (err) {
      alert("Erro ao salvar título.");
    }
  };

  // Excluir still
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePhoto(deleteId);
      setStills(stills.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Erro ao excluir frame.");
    }
  };

  // Alternar visibilidade
  const handleTogglePublished = async (still: StillItem) => {
    const nextPublished = !still.isPublished;
    try {
      await togglePhotoPublished(still.id, nextPublished);
      setStills(
        stills.map((s) => (s.id === still.id ? { ...s, isPublished: nextPublished } : s))
      );
    } catch (err) {
      alert("Erro ao alterar visibilidade.");
    }
  };

  // Estados de Drag & Drop para Stills
  const [dragStillIndex, setDragStillIndex] = useState<number | null>(null);
  const [dropStillIndex, setDropStillIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const showOrderNotification = (msg: string) => {
    setOrderNotification(msg);
    setTimeout(() => setOrderNotification(null), 3000);
  };

  const persistOrder = async (newStills: StillItem[]) => {
    setSavingOrder(true);
    try {
      await reorderPhotos(newStills.map((s, idx) => ({ id: s.id, order: idx })));
      showOrderNotification("Ordem salva no site!");
    } catch (err: any) {
      alert("Erro ao salvar ordem das stills: " + (err.message || "Erro"));
    } finally {
      setSavingOrder(false);
    }
  };

  // Mover posição no carrossel (esquerda / direita)
  const handleMove = async (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stills.length) return;

    const newStills = [...stills];
    const temp = newStills[index];
    newStills[index] = newStills[targetIdx];
    newStills[targetIdx] = temp;

    const reordered = newStills.map((s, idx) => ({ ...s, order: idx }));
    setStills(reordered);
    await persistOrder(reordered);
  };

  const handleDrop = async (targetIdx: number) => {
    if (dragStillIndex === null || dragStillIndex === targetIdx) {
      setDragStillIndex(null);
      setDropStillIndex(null);
      return;
    }

    const reordered = [...stills];
    const [moved] = reordered.splice(dragStillIndex, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((s, idx) => ({ ...s, order: idx }));
    setStills(updated);
    setDragStillIndex(null);
    setDropStillIndex(null);
    await persistOrder(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Film className="text-[#e50914]" size={28} />
            <span>Stills & Frames de Projetos</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Adicione frames de projetos. Eles são exibidos lado a lado em um carrossel horizontal alinhado ao canto esquerdo do site.
          </p>
        </div>

        <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-300 font-medium">
          {stills.length} frames cadastrados
        </span>
      </div>

      {/* Bloco de Personalização do Título & Organização da Seção */}
      <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <ImageIcon size={18} />
              </span>
              <h2 className="text-base font-bold text-white">
                Título e Posição da Seção no Site
              </h2>
              <span className="bg-rose-600/90 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                SEÇÃO DA LANDING PAGE
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Personalize o nome exibido acima dos frames na página inicial e ordene a posição desta seção na Landing Page.
            </p>
          </div>

          <Link
            href="/admin/organize?tab=sections"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-white/10 transition-all hover:scale-[1.02] shadow shrink-0"
          >
            <ArrowUpDown size={15} className="text-[#e50914]" />
            <span>Organizar Posição na Página (Drag & Drop)</span>
          </Link>
        </div>

        <form onSubmit={handleSaveSectionTitle} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Título da Seção (Exibido na Página Inicial):</span>
              <span className="text-[11px] text-gray-500 font-normal">Ex: Stills, Frames, Projetos & Frames, Ensaios...</span>
            </label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Ex: Stills"
              className="w-full bg-[#222] border border-[#555] focus:border-[#e50914] focus:outline-none rounded-xl px-4 py-2.5 text-white text-sm font-semibold tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={savingTitle || !sectionTitle.trim()}
            className="w-full sm:w-auto bg-[#e50914] hover:bg-[#f6121d] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer shrink-0 sm:self-end h-[42px]"
          >
            {savingTitle ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Salvando...</span>
              </>
            ) : titleSavedSuccess ? (
              <>
                <Check size={15} className="text-white" />
                <span>Título Salvo!</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Salvar Título</span>
              </>
            )}
          </button>
        </form>

        {titleSavedSuccess && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in">
            <Check size={15} className="text-emerald-400 shrink-0" />
            <span>Título atualizado para "{sectionTitle}". Ele já está ativo na página inicial e na aba de organização!</span>
          </div>
        )}
      </div>

      {/* Caixa de Upload Rápido */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Upload size={16} className="text-[#e50914]" />
          <span>Adicionar Novos Frames</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Campo de Título Opcional do Projeto */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs text-gray-400 font-medium">
              Nome do Projeto / Cena (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: DOIS ROLEX, VÓ - TIO SAM..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-[#222] border border-[#444] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2.5 text-white text-xs"
            />
          </div>

          {/* Botão de Upload de Arquivos do Computador */}
          <div className="md:col-span-7 flex flex-col sm:flex-row gap-3 pt-4 sm:pt-0 sm:self-end">
            <label className="flex-1 bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              <span>Fazer Upload de Frames (1 ou Vários)</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Ou adicionar via link */}
        <form onSubmit={handleAddByUrl} className="pt-2 border-t border-white/5 flex gap-2">
          <input
            type="text"
            placeholder="Ou cole a URL direta de uma imagem (JPG, PNG, WebP)..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2 text-white text-xs"
          />
          <button
            type="submit"
            disabled={!urlInput.trim() || uploading}
            className="bg-[#2a2a2a] hover:bg-[#333] text-gray-200 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            Adicionar URL
          </button>
        </form>
      </div>

      {/* Lista de Frames (Exibidos Lado a Lado como na Página Inicial) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Film size={16} className="text-[#e50914]" />
            <span>Frames na Página Inicial (Ordem de Exibição):</span>
          </h3>
          <div className="flex items-center gap-3">
            {savingOrder && (
              <span className="text-xs text-amber-400 font-medium animate-pulse flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />
                Salvando ordem...
              </span>
            )}
            {orderNotification && (
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                ✓ {orderNotification}
              </span>
            )}
            <span className="text-xs text-gray-500 hidden sm:inline">
              Arraste os cards ou use as setas para reordenar
            </span>
          </div>
        </div>

        {stills.length === 0 ? (
          <div className="bg-[#141414] border border-white/10 p-12 rounded-xl text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
              <ImageIcon size={28} />
            </div>
            <p className="text-gray-300 font-semibold text-base">
              Nenhum frame adicionado ainda.
            </p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Use o botão acima para enviar fotos e frames de projetos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stills.map((still, idx) => {
              const isDragging = dragStillIndex === idx;
              const isOver = dropStillIndex === idx;

              return (
                <div
                  key={still.id}
                  draggable
                  onDragStart={(e) => {
                    setDragStillIndex(idx);
                    e.dataTransfer.setData("text/plain", `${idx}`);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dropStillIndex !== idx) setDropStillIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (dropStillIndex === idx) setDropStillIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(idx);
                  }}
                  onDragEnd={() => {
                    setDragStillIndex(null);
                    setDropStillIndex(null);
                  }}
                  className={`group bg-[#161616] border rounded-lg overflow-hidden flex flex-col justify-between transition-all select-none ${
                    isDragging ? "opacity-30 scale-95 border-dashed border-[#e50914]" : ""
                  } ${
                    isOver ? "ring-2 ring-[#e50914] scale-102" : ""
                  } ${
                    still.isPublished
                      ? "border-white/10 hover:border-white/30"
                      : "border-white/5 opacity-50"
                  }`}
                >
                  {/* Imagem 16:9 */}
                  <div className="relative aspect-[16/9] bg-black overflow-hidden cursor-grab active:cursor-grabbing">
                    <img
                      src={still.imageUrl}
                      alt={still.title || "Still"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />

                    {/* Badge de Ordem #1, #2... */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-white border border-white/20 shadow-md">
                      <GripVertical size={11} className="text-gray-400" />
                      <span>#{idx + 1}</span>
                    </div>

                    {/* Botões de Mover Ordem (Esquerda / Direita) */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded border border-white/20 shadow-md">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(idx, "left");
                        }}
                        className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        title="Mover para a esquerda (aparecer antes)"
                      >
                        <MoveLeft size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stills.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(idx, "right");
                        }}
                        className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        title="Mover para a direita (aparecer depois)"
                      >
                        <MoveRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Título do Frame */}
                  <div className="p-3 space-y-1">
                    {editingId === still.id ? (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle(still.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="flex-1 bg-[#222] border border-[#555] rounded px-2 py-1 text-xs text-white"
                          placeholder="Nome do projeto"
                        />
                        <button
                          onClick={() => handleSaveTitle(still.id)}
                          className="p-1 bg-[#e50914] text-white rounded cursor-pointer"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-gray-700 text-gray-300 rounded cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white text-xs font-bold uppercase truncate font-sans">
                          {still.title || "Sem título"}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(still.id);
                            setEditingTitle(still.title || "");
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 rounded cursor-pointer transition-opacity"
                          title="Editar nome"
                        >
                          <Edit2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Barra de Ações Inferior */}
                  <div className="p-2 bg-[#1c1c1c] border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePublished(still)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        still.isPublished
                          ? "text-emerald-400 hover:bg-emerald-400/10"
                          : "text-gray-500 hover:bg-white/5"
                      }`}
                      title={still.isPublished ? "Ocultar do site" : "Publicar no site"}
                    >
                      {still.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                      onClick={() => setDeleteId(still.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                      title="Excluir frame"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5 text-red-500 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Excluir Frame</span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Tem certeza que deseja remover este frame da seção de Stills?
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-[#e50914] hover:bg-[#f6121d] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
