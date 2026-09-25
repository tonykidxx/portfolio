"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Film,
  Camera,
  FolderTree,
  Users,
  Settings,
  ExternalLink,
  LogOut,
  ArrowUpDown,
  MonitorPlay,
} from "lucide-react";

interface AdminSidebarProps {
  user?: any;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projetos (Vídeos)", icon: Film },
    { href: "/admin/presentation", label: "Vídeo de Apresentação", icon: MonitorPlay },
    { href: "/admin/stills", label: "Stills", icon: Camera },
    { href: "/admin/categories", label: "Categorias", icon: FolderTree },
    { href: "/admin/organize", label: "Organizar Ordem", icon: ArrowUpDown },
    { href: "/admin/clients", label: "Clientes & Creators", icon: Users },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#141414] border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="space-y-1">
          <Link href="/admin" className="block">
            <span className="font-black text-xl text-[#e50914] uppercase tracking-wider">
              CANDY MACHINE
            </span>
          </Link>
          <p className="text-xs text-gray-400">Painel de Controle</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#e50914] text-white shadow-md font-semibold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Logout */}
      <div className="pt-6 border-t border-white/10 space-y-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors py-1 px-2 rounded bg-white/5 hover:bg-white/10"
        >
          <span>Ver Site Público</span>
          <ExternalLink size={14} />
        </a>

        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="text-xs truncate">
            <p className="text-white font-medium truncate">{user?.name || "Admin"}</p>
            <p className="text-gray-500 truncate">{user?.email}</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
