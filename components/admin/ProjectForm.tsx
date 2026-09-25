"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/actions/project-actions";
import {
  Upload,
  Film,
  Image as ImageIcon,
  Check,
  Loader2,
  ArrowLeft,
  Monitor,
  Smartphone,
  Shuffle,
  Sparkles,
  Crop,
} from "lucide-react";
import Link from "next/link";
import { ThumbnailAdjusterModal } from "./ThumbnailAdjusterModal";
import { VideoTimelineSelector } from "./VideoTimelineSelector";
import {
  getVideoEmbed,
  getYouTubeThumbnail,
  isYouTubeShorts,
  getYouTubeFrames,
  getRandomYouTubeFrame,
  captureVideoFrame,
  getYouTubeId,
  upgradeYouTubeThumbToHighRes,
} from "@/lib/video-utils";

interface Category {
  id: string;
  name: string;
}

interface ProjectFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    thumbUrl?: string | null;
    isVertical?: boolean;
    isHero?: boolean;
    isPublished?: boolean;
    categoryId: string;
  };
}

export function ProjectForm({ categories, initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [thumbUrl, setThumbUrl] = useState(initialData?.thumbUrl || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ""
  );
  const [isVertical, setIsVertical] = useState(initialData?.isVertical || false);
  const [isHero, setIsHero] = useState(initialData?.isHero || false);
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ?? true
  );

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [error, setError] = useState("");

  const detectVideoAspectRatio = (url: string) => {
    try {
      const tempVideo = document.createElement("video");
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        if (tempVideo.videoHeight > tempVideo.videoWidth) {
          setIsVertical(true);
        } else {
          setIsVertical(false);
        }
      };
    } catch (e) {
      // Ignore if cannot load metadata
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "video" | "thumb"
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    if (type === "video") setUploadingVideo(true);
    else setUploadingThumb(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload do arquivo.");
      const data = await res.json();

      if (type === "video") {
        setVideoUrl(data.url);
        detectVideoAspectRatio(data.url);
      } else {
        setThumbUrl(data.url);
      }
    } catch (err: any) {
      alert(err.message || "Falha ao enviar arquivo.");
    } finally {
      if (type === "video") setUploadingVideo(false);
      else setUploadingThumb(false);
    }
  };

  const handleVideoUrlChange = (val: string) => {
    setVideoUrl(val);
    if (isYouTubeShorts(val)) {
      setIsVertical(true);
    }
    const autoThumb = getYouTubeThumbnail(val);
    if (autoThumb && !thumbUrl) {
      setThumbUrl(autoThumb);
    }
  };

  const videoEmbed = getVideoEmbed(videoUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !videoUrl.trim() || !categoryId) {
      setError("Título, Vídeo e Categoria são campos obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const finalThumb = upgradeYouTubeThumbToHighRes(thumbUrl) || thumbUrl;

      if (isEditing) {
        await updateProject(initialData.id, {
          title,
          description,
          videoUrl,
          thumbUrl: finalThumb,
          isVertical,
          isHero,
          isPublished,
          categoryId,
        });
      } else {
        await createProject({
          title,
          description,
          videoUrl,
          thumbUrl: finalThumb,
          isVertical,
          isHero,
          isPublished,
          categoryId,
        });
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar projeto.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="p-2 bg-[#222] hover:bg-[#333] text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? "Editar Projeto" : "Novo Projeto"}
            </h1>
            <p className="text-xs text-gray-400">
              Preencha as informações do vídeo para o portfólio.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#e50914] hover:bg-[#f6121d] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>{isEditing ? "Salvar Alterações" : "Criar Projeto"}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-200 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Main Details */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">Título do Projeto *</label>
          <input
            type="text"
            required
            placeholder="Ex: Comercial Marca X 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">Categoria *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">Descrição (Opcional)</label>
          <textarea
            rows={3}
            placeholder="Resumo do projeto, conceito ou ficha técnica rápida..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
        </div>
      </div>

      {/* Video & Thumbnail Section */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Mídia e Arquivos
        </h3>

        {/* Video Upload or URL */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-200 flex items-center justify-between">
            <span>Arquivo de Vídeo ou URL *</span>
            <span className="text-xs text-gray-400">MP4, WebM ou link externo</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="https://youtube.com/watch?v=... ou faça upload"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              className="flex-1 bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />

            <label className="bg-[#333] hover:bg-[#444] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10 shrink-0">
              {uploadingVideo ? (
                <Loader2 size={16} className="animate-spin text-[#e50914]" />
              ) : (
                <Upload size={16} />
              )}
              <span>Upload de Vídeo</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={uploadingVideo}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, "video");
                }}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/40 text-[11px] font-semibold">
              YouTube Não-Listado Suportado
            </span>
            <span>Cole links do YouTube (vídeos não-listados ou públicos), Shorts, Vimeo ou faça upload de arquivo direto.</span>
          </div>
        </div>

        {/* Seletor de Thumbnail com Timeline de Frames */}
        <div className="pt-2">
          <VideoTimelineSelector
            videoUrl={videoUrl}
            currentThumbUrl={thumbUrl}
            isVertical={isVertical}
            onSelectThumbnail={(newThumb) => setThumbUrl(newThumb)}
            onOpenAdjuster={() => setShowAdjuster(true)}
          />

          {/* Modal de Ajuste de Recorte / Tarjas Pretas */}
          <ThumbnailAdjusterModal
            isOpen={showAdjuster}
            onClose={() => setShowAdjuster(false)}
            imageUrl={
              thumbUrl ||
              (videoUrl ? getYouTubeThumbnail(videoUrl) || getRandomYouTubeFrame(videoUrl) : "") ||
              ""
            }
            projectTitle={title || "Prévia do Projeto"}
            isVertical={isVertical}
            onSave={(newUrl) => {
              setThumbUrl(newUrl);
            }}
          />
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-4">
        <div>
          <h3 className="font-bold text-white text-base">
            Proporção do Vídeo (Aspect Ratio) *
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Escolha se o projeto é exibido em formato Horizontal (16:9) ou Vertical (9:16). Detectado automaticamente no upload do vídeo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setIsVertical(false)}
            className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
              !isVertical
                ? "bg-[#e50914]/10 border-[#e50914] text-white shadow-lg shadow-red-950/30"
                : "bg-[#222] border-white/5 text-gray-400 hover:border-white/20"
            }`}
          >
            <div className={`p-3 rounded-lg ${!isVertical ? "bg-[#e50914] text-white" : "bg-white/10 text-gray-300"}`}>
              <Monitor size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">16:9 Horizontal</span>
                {!isVertical && (
                  <span className="bg-[#e50914] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    ATIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Formato Widescreen / Cinema / YouTube
              </p>
              <div className="mt-3 w-24 aspect-[16/9] bg-black/60 rounded border border-white/10 flex items-center justify-center text-[10px] text-gray-300 font-mono">
                16 : 9
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsVertical(true)}
            className={`p-4 rounded-xl border text-left flex items-start gap-4 transition-all cursor-pointer ${
              isVertical
                ? "bg-[#e50914]/10 border-[#e50914] text-white shadow-lg shadow-red-950/30"
                : "bg-[#222] border-white/5 text-gray-400 hover:border-white/20"
            }`}
          >
            <div className={`p-3 rounded-lg ${isVertical ? "bg-[#e50914] text-white" : "bg-white/10 text-gray-300"}`}>
              <Smartphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">9:16 Vertical</span>
                {isVertical && (
                  <span className="bg-[#e50914] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    ATIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Formato Reels, TikTok, Shorts e Stories
              </p>
              <div className="mt-3 w-14 aspect-[9/16] bg-black/60 rounded border border-white/10 flex items-center justify-center text-[10px] text-gray-300 font-mono">
                9 : 16
              </div>
            </div>
          </button>
        </div>

        {/* Live Preview */}
        {(videoUrl || thumbUrl) && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <p className="text-xs font-semibold text-gray-300">
              Pré-visualização com Aspect Ratio {isVertical ? "9:16 (Vertical)" : "16:9 (Horizontal)"}:
            </p>
            <div className="flex items-center justify-center bg-black/80 rounded-xl p-4 border border-white/5">
              <div
                className={`overflow-hidden rounded-lg border border-white/20 bg-black shadow-2xl ${
                  isVertical ? "w-[180px] aspect-[9/16]" : "w-[340px] aspect-[16/9]"
                }`}
              >
                {videoUrl ? (
                  videoEmbed.type === "youtube" || videoEmbed.type === "vimeo" ? (
                    <iframe
                      src={videoEmbed.embedUrl}
                      title="Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )
                ) : thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Options & Visibility */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-4">
        <h3 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Visibilidade e Destaque
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-[#222] rounded-lg cursor-pointer border border-white/5 hover:border-white/20 transition-all">
            <input
              type="checkbox"
              checked={isHero}
              onChange={(e) => setIsHero(e.target.checked)}
              className="w-4 h-4 accent-[#e50914]"
            />
            <div>
              <p className="text-sm font-semibold text-white">Vídeo Destaque (Hero)</p>
              <p className="text-xs text-gray-400">Exibir com destaque no topo da página</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-[#222] rounded-lg cursor-pointer border border-white/5 hover:border-white/20 transition-all">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-[#e50914]"
            />
            <div>
              <p className="text-sm font-semibold text-white">Publicado</p>
              <p className="text-xs text-gray-400">Visível para os visitantes na Landing Page</p>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
}
