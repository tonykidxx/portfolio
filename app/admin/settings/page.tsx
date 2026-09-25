import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const revalidate = 0;

export default async function SettingsAdminPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configurações do Site</h1>
        <p className="text-sm text-gray-400">
          Gerencie o nome do estúdio, textos do banner principal e contatos do site.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
