"use client";

interface ServiceItem {
  number: string;
  title: string;
  description: string;
}

interface ServicesSectionProps {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  itemsJson?: string | null;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    number: "01",
    title: "Direção Criativa",
    description:
      "Conceito, estética, narrativa, referências e direção visual para campanhas e lançamentos.",
  },
  {
    number: "02",
    title: "Videoclipes",
    description:
      "Da pré-produção ao corte final, com linguagem visual pensada para identidade e performance.",
  },
  {
    number: "03",
    title: "Conteúdo & Campanhas",
    description:
      "Conteúdo para social media, anúncios, campanhas comerciais e peças verticais de alta retenção.",
  },
  {
    number: "04",
    title: "Pós & VFX",
    description:
      "Edição, color grading, motion, composição e acabamento para elevar a percepção final do projeto.",
  },
];

export function ServicesSection({
  eyebrow = "O QUE FAZEMOS",
  title = "Da ideia à entrega final.",
  subtitle = "Criamos peças visuais que unem direção criativa, produção e pós para marcas, artistas e projetos que querem construir imagem — não apenas preencher feed.",
  itemsJson,
}: ServicesSectionProps) {
  let items: ServiceItem[] = DEFAULT_SERVICES;
  if (itemsJson) {
    try {
      const parsed = JSON.parse(itemsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    } catch (e) {
      items = DEFAULT_SERVICES;
    }
  }

  const defaultSubtitle =
    "Criamos peças visuais que unem direção criativa, produção e pós para marcas, artistas e projetos que querem construir imagem — não apenas preencher feed.";
  const finalSubtitle =
    subtitle !== undefined && subtitle !== null ? subtitle : defaultSubtitle;

  return (
    <section className="relative z-10 w-full bg-[#181818] border-y border-white/5 px-[4%] py-16 sm:py-20 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <p className="text-xs sm:text-sm font-bold tracking-[2.5px] text-gray-400 uppercase font-sans">
            {eyebrow || "O QUE FAZEMOS"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-sans">
            {title || "Da ideia à entrega final."}
          </h2>
        </div>

        {finalSubtitle && finalSubtitle.trim() !== "" && (
          <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed max-w-lg lg:text-right">
            {finalSubtitle}
          </p>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="group relative bg-[#202020] border border-white/5 hover:border-white/20 p-6 sm:p-7 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <span className="block text-3xl sm:text-4xl font-sans font-bold text-white/25 group-hover:text-[#e50914] transition-colors duration-300 mb-5 tracking-tight">
                {item.number}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white font-sans mb-2.5 tracking-tight group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
