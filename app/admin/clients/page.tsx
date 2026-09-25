import { prisma } from "@/lib/prisma";
import { ClientManager } from "@/components/admin/ClientManager";

export const revalidate = 0;

export default async function ClientsAdminPage() {
  const clients = await prisma.client.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <ClientManager initialClients={clients} />
    </div>
  );
}
