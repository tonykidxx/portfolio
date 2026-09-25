"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MonitorPlay,
  Check,
  AlertCircle,
  Upload,
  Play,
  Film,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";
import { updateSiteSettings } from "@/actions/settings-actions";
import { VideoModal } from "@/components/ui/VideoModal";
import {
  getVideoEmbed,
  getYouTubeId,
  getVimeoId,
  getHighResThumbnail,
} from "@/lib/video-utils";

interface PresentationManagerProps {
  initialSettings: any;
  currentHeroProject?: {
    id: string;
    title: string;
    videoUrl: string;
    category?: { name: string } | null;
  } | null;
}

export function PresentationManager({
  initialSettings,
  currentHeroProject,
}: PresentationManagerProps) {
  const router = useRouter();

  const [enabled, setEnabled] = useState<boolean>(
    initialSettings?.presentationEnabled ?? false
  );
  const [videoUrl, setVideoUrl] = useState<string>(
    initialSettings?.presentationVideoUrl || ""
  );
  const [title, setTitle] = useState<string>(
    initialSettings?.presentationTitle || ""
  );
  const [subtitle, setSubtitle] = useState<string>(
    initialSettings?.presentationSubtitle || ""
  );
  const [categoryTag, setCategoryTag] = useState<string>(
    initialSettings?.presentationCategory || "Apresentação"
  );
  const [thumbUrl, setThumbUrl] = useState<string>(
    initialSettings?.presentationThumbUrl || ""
  );
  const [isVertical, setIsVertical] = useState<boolean>(
    initialSettings?.presentationIsVertical ?? false
  );

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isTestingModal, setIsTestingModal] = useState(false);

  // Detecção de tipo de vídeo
  const ytId = videoUrl ? getYouTubeId(videoUrl) : null;
  const vimeoId = videoUrl ? getVimeoId(videoUrl) : null;
  const isDirect = videoUrl && !ytId && !vimeoId;

  // Thumbnail para exibição
  const displayThumb =
    thumbUrl || (videoUrl ? getHighResThumbnail(null, videoUrl) : "");

  // Upload de vídeo direto
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha ao fazer upload do vídeo.");
      }

      const data = await res.json();
      setVideoUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro no upload do vídeo.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // Upload de thumbnail personalizada
  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha ao fazer upload da imagem.");
      }

      const data = await res.json();
      setThumbUrl(data.url);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro no upload da thumbnail.");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Salvar configurações
  const handleSave = async (overrideEnabled?: boolean) => {
    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    const activeState =
      overrideEnabled !== undefined ? overrideEnabled : enabled;

    try {
      await updateSiteSettings({
        presentationEnabled: activeState,
        presentationVideoUrl: videoUrl.trim() || null,
        presentationTitle: title.trim() || null,
        presentationSubtitle: subtitle.trim() || null,
        presentationCategory: categoryTag.trim() || "Apresentação",
        presentationThumbUrl: thumbUrl.trim() || null,
        presentationIsVertical: isVertical,
      });

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao salvar configurações.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle rápido de ativação com salvamento imediato opcional
  const handleToggle = () => {
    const nextState = !enabled;
    setEnabled(nextState);
  };

  // Objeto simulado para testar no VideoModal
  const previewProject = {
    id: "preview-presentation",
    title: title || initialSettings?.siteName || "CANDY MACHINE STUDIOS",
    description: subtitle || null,
    videoUrl: videoUrl || "",
    thumbUrl: displayThumb || null,
    isVertical,
    category: {
      name: categoryTag || "Apresentação",
    },
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#e50914]/20 border border-[#e50914]/30 flex items-center justify-center text-[#e50914]">
            <MonitorPlay size={22} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Vídeo de Apresentação
            </h1>
            <p className="text-sm text-gray-400">
              Configure o vídeo institucional / showreel para o topo da página inicial sem exibi-lo nas categorias.
            </p>
          </div>
        </div>
      </div>

      {/* Card de Status & Ativação Principal */}
      <div
        className={`p-6 sm:p-7 rounded-xl border transition-all duration-300 ${
          enabled
            ? "bg-gradient-to-r from-emerald-950/40 via-[#181818] to-[#181818] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            : "bg-[#181818] border-white/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  enabled
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-white/10 text-gray-400 border border-white/10"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    enabled ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
                  }`}
                />
                {enabled ? "Ativado na Página Inicial" : "Desativado"}
              </span>

              {enabled && (
                <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
                  Hero do site substituído pelo vídeo de apresentação
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white">
              {enabled
                ? "O Vídeo de Apresentação está ATIVO"
                : "Ativar Vídeo de Apresentação no Hero"}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {enabled ? (
                <>
                  Este vídeo está sendo reproduzido no topo do site (mudo em loop), e ao clicar em{" "}
                  <strong className="text-white">Assistir</strong> abre o player com som completo.{" "}
                  <strong className="text-emerald-300">
                    Ele não aparece misturado nas categorias do portfólio.
                  </strong>
                </>
              ) : (
                <>
                  Quando ativado, desativa o vídeo hero padrão dos projetos e assume o topo do site.{" "}
                  Ele não aparecerá entre os vídeos das categorias.
                </>
              )}
            </p>
          </div>

          {/* Botão de Chave Toggle */}
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enabled ? "bg-emerald-500" : "bg-zinc-700"
            }`}
            aria-label="Ativar ou desativar vídeo de apresentação"
          >
            <span
              className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                enabled ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Informação sobre o Hero Atual dos Projetos */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Film size={14} className="text-[#e50914] shrink-0" />
            <span>
              Vídeo Hero reserva nos projetos:{" "}
              <strong className="text-white">
                {currentHeroProject?.title || "Nenhum projeto marcado com Hero"}
              </strong>
              {currentHeroProject?.category?.name && (
                <span className="text-gray-400 ml-1">
                  ({currentHeroProject.category.name})
                </span>
              )}
            </span>
          </div>

          <span className="text-gray-500 hidden md:inline">
            {enabled
              ? "Pausado no topo (o vídeo de apresentação está ativo)"
              : "Em exibição no topo"}
          </span>
        </div>
      </div>

      {/* Formulário de Configuração */}
      <div className="bg-[#181818] border border-white/10 rounded-xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-[#e50914]" />
          <span>Configuração da Mídia e Informações</span>
        </h3>

        {/* URL do Vídeo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-200">
              Link do Vídeo (YouTube, Vimeo ou Arquivo Direto MP4)
            </label>
            {ytId && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 font-medium">
                YouTube detectado
              </span>
            )}
            {vimeoId && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/40 font-medium">
                Vimeo detectado
              </span>
            )}
            {isDirect && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-medium">
                Arquivo direto detectado
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/... ou https://.../video.mp4"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1 bg-[#222] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
            />

            <label className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#2a2a2a] hover:bg-[#333] border border-white/15 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors shrink-0">
              <Upload size={16} />
              <span>{isUploadingVideo ? "Enviando..." : "Subir Arquivo MP4"}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                disabled={isUploadingVideo}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Você pode colar o link de um vídeo do YouTube (não-listado ou público), Vimeo ou subir um arquivo de vídeo diretamente.
          </p>
        </div>

        {/* Título e Subtítulo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Título no Hero (Letras Garrafais)
            </label>
            <input
              type="text"
              placeholder="ex: CANDY MACHINE STUDIOS ou SHOWREEL 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#222] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
            />
            <p className="text-xs text-gray-400">
              Se deixar vazio, exibirá o nome do estúdio padrão.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Etiqueta / Categoria Visual
            </label>
            <input
              type="text"
              placeholder="ex: Apresentação ou Showreel"
              value={categoryTag}
              onChange={(e) => setCategoryTag(e.target.value)}
              className="w-full bg-[#222] border border-white/15 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
            />
            <p className="text-xs text-gray-400">
              Tag exibida abaixo do título no topo (ex: &quot;Apresentação&quot;).
            </p>
          </div>
        </div>

        {/* Subtítulo / Descrição */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">
            Subtítulo / Descrição Curta (Opcional)
          </label>
          <textarea
            rows={2}
            placeholder="ex: Showreel oficial e apresentação institucional da Candy Machine Studios."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-[#222] border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm resize-none"
          />
        </div>

        {/* Thumbnail / Pôster Opcional */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-sm font-semibold text-gray-200">
            Pôster / Imagem de Fundo (Thumbnail de Inicialização)
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="text"
              placeholder="URL da imagem (opcional, gerada automaticamente para o YouTube)"
              value={thumbUrl}
              onChange={(e) => setThumbUrl(e.target.value)}
              className="flex-1 bg-[#222] border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
            />

            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#333] border border-white/15 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors shrink-0">
              <Upload size={14} />
              <span>{isUploadingThumb ? "Enviando..." : "Subir Pôster JPG/PNG"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbUpload}
                disabled={isUploadingThumb}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Opção Vertical */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isVertical}
              onChange={(e) => setIsVertical(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-[#e50914] focus:ring-[#e50914] bg-[#222]"
            />
            <span className="text-sm text-gray-300">
              Vídeo no Formato Vertical (9:16 Shorts/Reels)
            </span>
          </label>
        </div>
      </div>

      {/* Pré-visualização e Teste */}
      {videoUrl && (
        <div className="bg-[#181818] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play size={16} className="text-[#e50914] fill-current" />
                <span>Pré-visualização do Vídeo</span>
              </h3>
              <p className="text-xs text-gray-400">
                Verifique como o vídeo será reproduzido na página inicial e teste a reprodução com áudio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsTestingModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-white/90 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <Play size={14} className="fill-black" />
              <span>Testar Reprodução com Áudio (Modal)</span>
            </button>
          </div>

          {/* Miniatura / Prévia */}
          <div className="relative aspect-video max-w-lg mx-auto bg-black rounded-lg overflow-hidden border border-white/10">
            {displayThumb ? (
              <img
                src={displayThumb}
                alt="Preview"
                className="w-full h-full object-cover filter brightness-[0.85]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                Carregando prévia do vídeo...
              </div>
            )}

            {/* Overlay com título e botão */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-4 flex flex-col justify-between pointer-events-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e50914]">
                {categoryTag || "Apresentação"}
              </span>

              <div>
                <h4 className="font-bebas text-2xl text-white tracking-wide uppercase leading-tight">
                  {title || initialSettings?.siteName || "CANDY MACHINE STUDIOS"}
                </h4>
                {subtitle && (
                  <p className="text-[11px] text-gray-300 line-clamp-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagens de Feedback */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-3">
          <Check size={18} className="shrink-0" />
          <span>Configurações do vídeo de apresentação salvas com sucesso!</span>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#e50914] text-white font-bold px-7 py-3.5 rounded-lg text-sm hover:bg-[#b80710] transition-all shadow-xl hover:scale-102 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <span>Salvando...</span>
          ) : (
            <>
              <Check size={16} />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <span>Visualizar Página Inicial</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Modal de Teste com Áudio */}
      {isTestingModal && (
        <VideoModal
          project={previewProject}
          onClose={() => setIsTestingModal(false)}
        />
      )}
    </div>
  );
}
