"use client";

import { useState, useRef } from "react";
import {
  createPhoto,
  createMultiplePhotos,
  updatePhoto,
  deletePhoto,
  togglePhotoPublished,
  reorderPhotos,
} from "@/actions/photo-actions";
import {
  Camera,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Images,
} from "lucide-react";

interface PhotoItem {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  category?: string | null;
  order: number;
  isPublished: boolean;
}

const CATEGORY_SUGGESTIONS = [
  "Editorial",
  "Still",
  "Retrato",
  "Campanha",
  "Moda",
  "Comercial",
  "Bastidores",
];

export function PhotoManager({ initialPhotos }: { initialPhotos: PhotoItem[] }) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Editorial");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Batch upload state
  const [batchUploading, setBatchUploading] = useState(false);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setImageUrl("");
    setTitle("");
    setSubtitle("");
    setCategory("Editorial");
    setEditingPhoto(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (photo: PhotoItem) => {
    setEditingPhoto(photo);
    setImageUrl(photo.imageUrl);
    setTitle(photo.title || "");
    setSubtitle(photo.subtitle || "");
    setCategory(photo.category || "Editorial");
    setIsModalOpen(true);
  };

  // Upload de arquivo único
  const handleSingleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro no upload");
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err: any) {
      alert(err.message || "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  // Upload em lote (múltiplas fotos simultâneas)
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setBatchUploading(true);
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
        const newPhotos = await createMultiplePhotos(
          uploadedUrls.map((url) => ({
            imageUrl: url,
            category: "Editorial",
          }))
        );

        setPhotos((prev) => [...prev, ...newPhotos]);
      }
    } catch (err: any) {
      alert("Erro ao processar upload em lote.");
    } finally {
      setBatchUploading(false);
      if (batchInputRef.current) batchInputRef.current.value = "";
    }
  };

  // Salvar foto (Criar ou Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert("Faça o upload de uma imagem ou informe a URL.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingPhoto) {
        const updated = await updatePhoto(editingPhoto.id, {
          imageUrl,
          title: title.trim() || null,
          subtitle: subtitle.trim() || null,
          category: category.trim() || "Editorial",
        });
        setPhotos(photos.map((p) => (p.id === updated.id ? (updated as any) : p)));
      } else {
        const created = await createPhoto({
          imageUrl,
          title: title.trim() || undefined,
          subtitle: subtitle.trim() || undefined,
          category: category.trim() || "Editorial",
        });
        setPhotos([...photos, created as any]);
      }
      resetForm();
    } catch (err: any) {
      alert(err.message || "Erro ao salvar foto.");
    } finally {
      setSubmitting(false);
    }
  };

  // Alternar visibilidade
  const handleTogglePublished = async (photo: PhotoItem) => {
    const nextVal = !photo.isPublished;
    try {
      await togglePhotoPublished(photo.id, nextVal);
      setPhotos(
        photos.map((p) => (p.id === photo.id ? { ...p, isPublished: nextVal } : p))
      );
    } catch (err) {
      alert("Erro ao alterar visibilidade.");
    }
  };

  // Excluir foto
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePhoto(deleteId);
      setPhotos(photos.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Erro ao excluir foto.");
    }
  };

  // Reordenar foto (cima / baixo)
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;

    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIdx];
    newPhotos[targetIdx] = temp;

    // Atualiza as ordens locais
    const reordered = newPhotos.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    setPhotos(reordered);

    try {
      await reorderPhotos(reordered.map((p) => ({ id: p.id, order: p.order })));
    } catch (err) {
      alert("Erro ao salvar nova ordem.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Camera className="text-[#e50914]" size={28} />
            <span>Galeria de Fotos & Still</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gerencie os ensaios fotográficos, editoriais e imagens da seção de fotografia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Upload em Lote */}
          <label className="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-gray-200 hover:text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow">
            {batchUploading ? (
              <Loader2 size={16} className="animate-spin text-[#e50914]" />
            ) : (
              <Images size={16} className="text-[#e50914]" />
            )}
            <span>Upload em Lote</span>
            <input
              ref={batchInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={batchUploading}
              onChange={handleBatchUpload}
            />
          </label>

          {/* Adicionar Foto Individual */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg cursor-pointer"
          >
            <Plus size={18} />
            <span>Nova Foto</span>
          </button>
        </div>
      </div>

      {/* Grid de Fotos no Painel */}
      {photos.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 p-12 rounded-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
            <Camera size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-gray-300 font-semibold text-lg">
              Nenhuma foto cadastrada ainda.
            </p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Clique em &quot;Nova Foto&quot; ou faça &quot;Upload em Lote&quot; para publicar imagens no portfólio.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className={`group bg-[#161616] border rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                photo.isPublished ? "border-white/10 hover:border-white/30" : "border-white/5 opacity-60"
              }`}
            >
              {/* Imagem */}
              <div className="relative aspect-[3/4] bg-black overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title || "Foto"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge de Categoria */}
                {photo.category && (
                  <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                    {photo.category}
                  </span>
                )}

                {/* Botões de Mover Ordem */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 p-0.5 rounded border border-white/10">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-30 cursor-pointer"
                    title="Mover para cima"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    disabled={idx === photos.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 hover:bg-white/20 text-white rounded disabled:opacity-30 cursor-pointer"
                    title="Mover para baixo"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className="p-3 space-y-1">
                <h4 className="font-bold text-white text-xs truncate">
                  {photo.title || "Sem título"}
                </h4>
                {photo.subtitle && (
                  <p className="text-[11px] text-gray-400 truncate">
                    {photo.subtitle}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="p-2.5 bg-[#1f1f1f] border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleTogglePublished(photo)}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    photo.isPublished
                      ? "text-emerald-400 hover:bg-emerald-400/10"
                      : "text-gray-500 hover:bg-white/5"
                  }`}
                  title={photo.isPublished ? "Ocultar do site" : "Publicar no site"}
                >
                  {photo.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Editar foto"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteId(photo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                    title="Excluir foto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criação / Edição de Foto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera size={20} className="text-[#e50914]" />
                <span>{editingPhoto ? "Editar Foto" : "Adicionar Nova Foto"}</span>
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload da Imagem */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">
                  Imagem da Foto *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="URL da foto ou faça upload"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-[#222] border border-[#444] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2 text-white text-xs"
                  />
                  <label className="bg-[#333] hover:bg-[#444] text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10 shrink-0">
                    {uploading ? (
                      <Loader2 size={14} className="animate-spin text-[#e50914]" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleSingleUpload(f);
                      }}
                    />
                  </label>
                </div>

                {imageUrl && (
                  <div className="mt-2 w-32 aspect-[3/4] rounded-lg overflow-hidden border border-white/10 bg-black">
                    <img
                      src={imageUrl}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Título (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ensaio de Moda Verão"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#222] border border-[#444] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Subtítulo / Cliente */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Subtítulo / Cliente (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Editorial Vogue / Campanha 2026"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-[#222] border border-[#444] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              {/* Categoria / Tag */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Categoria / Tag
                </label>
                <input
                  type="text"
                  placeholder="Ex: Editorial, Still, Retrato..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#222] border border-[#444] focus:border-[#e50914] focus:outline-none rounded-lg px-3 py-2 text-white text-xs"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CATEGORY_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setCategory(sug)}
                      className={`text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        category === sug
                          ? "bg-[#e50914] text-white"
                          : "bg-[#252525] text-gray-400 hover:text-white"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  <span>{editingPhoto ? "Salvar Alterações" : "Adicionar Foto"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2.5 text-red-500 font-bold text-base">
              <AlertTriangle size={20} />
              <span>Excluir Foto</span>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Tem certeza que deseja excluir esta foto da galeria? Esta ação é definitiva.
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
