"use client";

interface CtaSectionProps {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  whatsappText?: string | null;
  instagramText?: string | null;
  whatsappUrl?: string | null;
  instagramUrl?: string | null;
  contactPhone?: string | null;
}

export function CtaSection({
  eyebrow = "NOVO PROJETO",
  title = "VAMOS CRIAR ALGUMA COISA QUE VALHA SER LEMBRADA?",
  description = "Conte sua ideia. A gente pensa na melhor forma de transformar o conceito em imagem e colocar o projeto na rua.",
  whatsappText = "Falar no WhatsApp",
  instagramText = "Ver Instagram",
  whatsappUrl,
  instagramUrl,
  contactPhone,
}: CtaSectionProps) {
  const cleanPhone = contactPhone ? contactPhone.replace(/\D/g, "") : "";
  const finalWhatsApp =
    whatsappUrl && whatsappUrl.trim() !== ""
      ? whatsappUrl
      : cleanPhone
      ? `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`}`
      : "https://wa.me/";

  const finalInstagram =
    instagramUrl && instagramUrl.trim() !== "" && !instagramUrl.includes("wa.me")
      ? instagramUrl
      : "https://www.instagram.com/candymachinestudios/";

  return (
    <section className="relative z-10 w-full bg-[#0a0a0a] border-t border-white/5 px-[4%] py-16 sm:py-24 overflow-hidden">
      {/* Soft Centered Red Radial Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 60%, rgba(229, 9, 20, 0.16) 0%, rgba(180, 0, 10, 0.07) 35%, rgba(10, 10, 10, 0) 70%)",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[450px] sm:w-[650px] h-[250px] sm:h-[350px] bg-[#e50914]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <p className="text-xs sm:text-sm font-bold tracking-[2.5px] text-gray-400 uppercase font-sans">
          {eyebrow || "NOVO PROJETO"}
        </p>

        <h2 className="font-bebas text-4xl sm:text-6xl lg:text-7xl font-normal leading-[0.93] tracking-[1.5px] text-white uppercase drop-shadow-md">
          {title || "VAMOS CRIAR ALGUMA COISA QUE VALHA SER LEMBRADA?"}
        </h2>

        <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed max-w-xl mx-auto">
          {description ||
            "Conte sua ideia. A gente pensa na melhor forma de transformar o conceito em imagem e colocar o projeto na rua."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
          <a
            href={finalWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black font-bold px-6 sm:px-7 py-3 rounded-[6px] text-sm sm:text-base hover:bg-white/85 transition-all shadow-xl hover:scale-102 active:scale-95 cursor-pointer font-sans"
          >
            {whatsappText || "Falar no WhatsApp"}
          </a>

          <a
            href={finalInstagram}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#222]/80 border border-white/15 text-white font-bold px-6 sm:px-7 py-3 rounded-[6px] text-sm sm:text-base hover:bg-white/10 transition-all shadow-xl hover:scale-102 active:scale-95 cursor-pointer font-sans backdrop-blur-xs"
          >
            {instagramText || "Ver Instagram"}
          </a>
        </div>
      </div>
    </section>
  );
}
