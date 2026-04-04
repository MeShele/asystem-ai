"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Inbox,
  Handshake,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/admin" as const, label: "Дашборд", icon: LayoutDashboard, badge: null },
  { href: "/admin/requests" as const, label: "Заявки", icon: Inbox, badge: "new" as const },
  { href: "/admin/partners" as const, label: "Партнёры", icon: Handshake, badge: null },
  { href: "/admin/projects" as const, label: "Проекты", icon: FolderKanban, badge: null },
  { href: "/admin/settings" as const, label: "Настройки", icon: Settings, badge: null },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const [requestCount, setRequestCount] = useState(0);
  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        const count = data.filter((r: { status?: string }) => !r.status || r.status === "new").length;
        setRequestCount(count);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 h-full border-r border-border-faint bg-surface flex flex-col transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border-faint">
          {!collapsed && (
            <span className="text-sm font-semibold text-text-primary">
              Admin Panel
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md border border-border-faint flex items-center justify-center hover:bg-surface-raised transition-colors flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />
            )}
          </button>
        </div>

        {/* Section label */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              Управление
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
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
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"}`} />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge === "new" && requestCount > 0 && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">
                        {requestCount}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge === "new" && requestCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border-faint p-2 space-y-1">
          <button className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-surface-raised transition-all w-full ${collapsed ? "justify-center" : ""}`}>
            <Bell className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Уведомления</span>}
          </button>
          <button
            onClick={() => {
              document.cookie = "admin_session=; path=/; max-age=0";
              window.location.href = "/admin/login";
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all w-full ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Выход</span>}
          </button>
        </div>
      </aside>

      {/* Main content — scrollable */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
