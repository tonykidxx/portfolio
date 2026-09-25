"use client";

interface PillItem {
  title: string;
  subtitle: string;
}

interface AboutSectionProps {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  pillsJson?: string | null;
}

const DEFAULT_PILLS: PillItem[] = [
  {
    title: "Audiovisual",
    subtitle: "Produção e direção",
  },
  {
    title: "Social",
    subtitle: "Conteúdo e campanhas",
  },
  {
    title: "Creative",
    subtitle: "Conceito e identidade",
  },
  {
    title: "Post",
    subtitle: "Edição, cor e VFX",
  },
];

export function AboutSection({
  eyebrow = "CANDY MACHINE STUDIOS",
  title = "IMAGEM COM INTENÇÃO.\nCONTEÚDO COM IDENTIDADE.",
  description = "Somos um estúdio criativo focado em transformar conceito em imagem. Trabalhamos entre direção criativa, audiovisual, conteúdo e pós-produção para construir projetos que tenham unidade estética, personalidade e valor de marca.",
  pillsJson,
}: AboutSectionProps) {
  let pills: PillItem[] = DEFAULT_PILLS;
  if (pillsJson) {
    try {
      const parsed = JSON.parse(pillsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        pills = parsed;
      }
    } catch (e) {
      pills = DEFAULT_PILLS;
    }
  }

  // Divide o título pelas quebras de linha para estilização cinematográfica
  const titleLines = (title || "IMAGEM COM INTENÇÃO.\nCONTEÚDO COM IDENTIDADE.").split("\n");

  return (
    <section className="relative z-10 w-full bg-[#121212] border-y border-white/5 px-[4%] py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Manifesto */}
        <div className="lg:col-span-7 space-y-5">
          <p className="text-xs sm:text-sm font-bold tracking-[2.5px] text-gray-400 uppercase font-sans">
            {eyebrow || "CANDY MACHINE STUDIOS"}
          </p>

          <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl font-normal leading-[0.93] tracking-[1.5px] text-white uppercase drop-shadow-sm">
            {titleLines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed max-w-xl">
            {description ||
              "Somos um estúdio criativo focado em transformar conceito em imagem. Trabalhamos entre direção criativa, audiovisual, conteúdo e pós-produção para construir projetos que tenham unidade estética, personalidade e valor de marca."}
          </p>
        </div>

        {/* Right Column: 2x2 Grid of Quick Specialties */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {pills.map((pill, idx) => (
            <div
              key={idx}
              className="group bg-[#181818] border border-white/5 hover:border-white/20 p-5 sm:p-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <h3 className="text-base sm:text-lg font-bold text-white font-sans group-hover:text-white transition-colors">
                {pill.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1">
                {pill.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
