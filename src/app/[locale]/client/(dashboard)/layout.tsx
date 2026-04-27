"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";

const navItems = [
  { href: "/client/dashboard" as const, label: "Дашборд", icon: LayoutDashboard },
  { href: "/client/projects" as const, label: "Проекты", icon: FolderKanban },
];

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    fetch("/api/client/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.client?.name) setClientName(data.client.name);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen">
      <aside
        className={`flex-shrink-0 h-full border-r border-border-faint bg-surface flex flex-col transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-faint">
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-semibold text-text-primary block truncate">
                {clientName || "Клиент"}
              </span>
              <span className="text-[10px] text-text-muted">Кабинет клиента</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md border border-border-faint flex items-center justify-center hover:bg-surface-raised transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Навигация</span>
          </div>
        )}

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/client/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-brand-500/10 text-brand-500"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${
                    isActive ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"
                  }`}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-faint p-2 space-y-1">
          <ThemeToggleButton collapsed={collapsed} />
          <button
            onClick={async () => {
              await fetch("/api/client/login", { method: "DELETE" });
              const locale = window.location.pathname.split("/")[1] || "ru";
              window.location.href = `/${locale}/client/login`;
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all w-full ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Выход</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
