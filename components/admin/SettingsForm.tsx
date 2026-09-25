"use client";

import { useState } from "react";
import Link from "next/link";
import { updateSiteSettings } from "@/actions/settings-actions";
import { Check, Loader2, Save, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface SettingsFormProps {
  initialSettings?: {
    siteName?: string;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    presentationEnabled?: boolean;
    contactEmail?: string | null;
    contactPhone?: string | null;
    instagramUrl?: string | null;
    whatsappUrl?: string | null;
    servicesEyebrow?: string | null;
    servicesTitle?: string | null;
    servicesSubtitle?: string | null;
    aboutEyebrow?: string | null;
    aboutTitle?: string | null;
    aboutDescription?: string | null;
    ctaEyebrow?: string | null;
    ctaTitle?: string | null;
    ctaDescription?: string | null;
    ctaWhatsappText?: string | null;
    ctaInstagramText?: string | null;
    photosTitle?: string | null;
  } | null;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const router = useRouter();

  const [siteName, setSiteName] = useState(
    initialSettings?.siteName || "CANDY MACHINE STUDIOS"
  );
  const [heroTitle, setHeroTitle] = useState(initialSettings?.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(
    initialSettings?.heroSubtitle || ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings?.contactEmail || ""
  );
  const [contactPhone, setContactPhone] = useState(
    initialSettings?.contactPhone || ""
  );
  const [instagramUrl, setInstagramUrl] = useState(
    initialSettings?.instagramUrl || ""
  );
  const [whatsappUrl, setWhatsappUrl] = useState(
    initialSettings?.whatsappUrl || ""
  );

  // Seção Stills / Frames
  const [photosTitle, setPhotosTitle] = useState(
    initialSettings?.photosTitle || "Stills"
  );

  // Seção O Que Fazemos
  const [servicesEyebrow, setServicesEyebrow] = useState(
    initialSettings?.servicesEyebrow || "O QUE FAZEMOS"
  );
  const [servicesTitle, setServicesTitle] = useState(
    initialSettings?.servicesTitle || "Da ideia à entrega final."
  );
  const [servicesSubtitle, setServicesSubtitle] = useState(
    initialSettings?.servicesSubtitle !== undefined &&
    initialSettings?.servicesSubtitle !== null &&
    initialSettings.servicesSubtitle.trim() !== ""
      ? initialSettings.servicesSubtitle
      : "Criamos peças visuais que unem direção criativa, produção e pós para marcas, artistas e projetos que querem construir imagem — não apenas preencher feed."
  );

  // Seção Sobre / Manifesto
  const [aboutEyebrow, setAboutEyebrow] = useState(
    initialSettings?.aboutEyebrow ?? "CANDY MACHINE STUDIOS"
  );
  const [aboutTitle, setAboutTitle] = useState(
    initialSettings?.aboutTitle ?? "IMAGEM COM INTENÇÃO.\nCONTEÚDO COM IDENTIDADE."
  );
  const [aboutDescription, setAboutDescription] = useState(
    initialSettings?.aboutDescription ??
      "Somos um estúdio criativo focado em transformar conceito em imagem. Trabalhamos entre direção criativa, audiovisual, conteúdo e pós-produção para construir projetos que tenham unidade estética, personalidade e valor de marca."
  );

  // Seção Novo Projeto / CTA
  const [ctaEyebrow, setCtaEyebrow] = useState(
    initialSettings?.ctaEyebrow ?? "NOVO PROJETO"
  );
  const [ctaTitle, setCtaTitle] = useState(
    initialSettings?.ctaTitle ?? "VAMOS CRIAR ALGUMA COISA QUE VALHA SER LEMBRADA?"
  );
  const [ctaDescription, setCtaDescription] = useState(
    initialSettings?.ctaDescription ??
      "Conte sua ideia. A gente pensa na melhor forma de transformar o conceito em imagem e colocar o projeto na rua."
  );
  const [ctaWhatsappText, setCtaWhatsappText] = useState(
    initialSettings?.ctaWhatsappText ?? "Falar no WhatsApp"
  );
  const [ctaInstagramText, setCtaInstagramText] = useState(
    initialSettings?.ctaInstagramText ?? "Ver Instagram"
  );

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");

    try {
      await updateSiteSettings({
        siteName,
        heroTitle,
        heroSubtitle,
        contactEmail,
        contactPhone,
        instagramUrl,
        whatsappUrl,
        photosTitle: photosTitle.trim() || "Stills",
        servicesEyebrow,
        servicesTitle,
        servicesSubtitle,
        aboutEyebrow,
        aboutTitle,
        aboutDescription,
        ctaEyebrow,
        ctaTitle,
        ctaDescription,
        ctaWhatsappText,
        ctaInstagramText,
      });
      router.refresh();
      setSuccessMsg("Configurações salvas com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm rounded-lg flex items-center gap-2">
          <Check size={18} className="text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Identidade e Cabeçalho
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">
            Nome do Estúdio / Marca
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
        </div>
      </div>

      {/* Hero Banner Override Settings */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Textos do Banner Principal (Hero)
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">
            Título Padrão do Hero
          </label>
          <input
            type="text"
            placeholder="Ex: FILMES E CONTEÚDO CINEMATOGRÁFICO"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-200">
            Subtítulo Padrão do Hero
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Estúdio criativo especializado em produções de alto impacto visual."
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
        </div>

        {/* Atalho para o Vídeo de Apresentação */}
        <div className="bg-[#1c1c1c] border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">Vídeo de Apresentação (Showreel)</span>
              {initialSettings?.presentationEnabled ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ATIVADO NA HOME
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-400">
                  DESATIVADO
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Substitua o vídeo hero por um vídeo de apresentação exclusivo que não aparece na lista de categorias.
            </p>
          </div>

          <Link
            href="/admin/presentation"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#e50914] hover:bg-[#b80710] text-white font-semibold text-xs transition-colors shrink-0 shadow-md"
          >
            <span>Gerenciar Apresentação</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Contact Settings */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3">
          Informações de Contato Comercial
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Email de Contato
            </label>
            <input
              type="email"
              placeholder="contato@estudio.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Telefone / WhatsApp (Texto ou Número)
            </label>
            <input
              type="text"
              placeholder="+55 11 99999-9999"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Link Direto do WhatsApp (Ex: https://wa.me/55...)
            </label>
            <input
              type="url"
              placeholder="https://wa.me/5511999999999"
              value={whatsappUrl}
              onChange={(e) => setWhatsappUrl(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Link do Perfil do Instagram
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/candymachinestudios"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Seção: Stills / Frames (Fotos) */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Seção: Stills / Frames de Projetos</span>
          </h2>
          <a
            href="/admin/stills"
            className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold"
          >
            Gerenciar Frames →
          </a>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Título da Seção no Site
            </label>
            <input
              type="text"
              placeholder="Ex: Stills, Frames, Ensaios..."
              value={photosTitle}
              onChange={(e) => setPhotosTitle(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
            <p className="text-xs text-gray-400">
              Este título aparece na página inicial acima do carrossel horizontal de frames e na lista de seções em Organizar Ordem.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: O Que Fazemos (Services) */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Seção: O Que Fazemos (Serviços)</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Subtítulo Superior (Eyebrow)
            </label>
            <input
              type="text"
              value={servicesEyebrow}
              onChange={(e) => setServicesEyebrow(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Título Principal
            </label>
            <input
              type="text"
              value={servicesTitle}
              onChange={(e) => setServicesTitle(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Descrição / Texto à Direita
            </label>
            <textarea
              rows={3}
              value={servicesSubtitle}
              onChange={(e) => setServicesSubtitle(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Sobre / Manifesto */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Seção: Sobre / Manifesto (Imagem com Intenção)</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Subtítulo Superior (Eyebrow)
            </label>
            <input
              type="text"
              value={aboutEyebrow}
              onChange={(e) => setAboutEyebrow(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Título Display (Quebre linhas com Enter)
            </label>
            <textarea
              rows={2}
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Texto Descritivo do Manifesto
            </label>
            <textarea
              rows={4}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Novo Projeto / CTA */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-6">
        <h2 className="font-bold text-white text-base border-b border-white/10 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Seção: Chamada Final (Novo Projeto / CTA)</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Subtítulo Superior (Eyebrow)
            </label>
            <input
              type="text"
              value={ctaEyebrow}
              onChange={(e) => setCtaEyebrow(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Título da Chamada (CTA)
            </label>
            <textarea
              rows={2}
              value={ctaTitle}
              onChange={(e) => setCtaTitle(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">
              Texto Explicativo
            </label>
            <textarea
              rows={3}
              value={ctaDescription}
              onChange={(e) => setCtaDescription(e.target.value)}
              className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">
                Texto do Botão WhatsApp
              </label>
              <input
                type="text"
                value={ctaWhatsappText}
                onChange={(e) => setCtaWhatsappText(e.target.value)}
                className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200">
                Texto do Botão Instagram
              </label>
              <input
                type="text"
                value={ctaInstagramText}
                onChange={(e) => setCtaInstagramText(e.target.value)}
                className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#e50914] hover:bg-[#f6121d] text-white px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Salvar Configurações</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
