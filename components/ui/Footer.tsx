interface FooterProps {
  siteName?: string;
  contactEmail?: string | null;
}

export function Footer({
  siteName = "CANDY MACHINE STUDIOS",
  contactEmail = "contato@candymachinestudios.com",
}: FooterProps) {
  return (
    <footer className="w-full bg-[#0a0a0a] text-[#b3b3b3] border-t border-white/10 py-10 px-[4%] font-sans">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-white font-bold text-base tracking-wider">{siteName}</p>
          <p className="text-[#808080] text-xs">
            © {new Date().getFullYear()} Todos os direitos reservados. Produção audiovisual e cinematográfica.
          </p>
        </div>

        {contactEmail && (
          <div className="text-center sm:text-right">
            <p className="text-xs text-[#808080]">Contato Comercial</p>
            <a
              href={`mailto:${contactEmail}`}
              className="text-[#b3b3b3] hover:text-white transition-colors underline font-medium"
            >
              {contactEmail}
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
