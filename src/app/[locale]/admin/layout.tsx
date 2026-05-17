"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Inbox,
  Handshake,
  FolderKanban,
  Users,
  UserCircle,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";
import { NotificationBell } from "@/components/shared/notification-bell";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/admin" as const, label: "Дашборд", icon: LayoutDashboard, badge: null },
  { href: "/admin/requests" as const, label: "Заявки", icon: Inbox, badge: "new" as const },
  { href: "/admin/projects" as const, label: "Проекты", icon: FolderKanban, badge: null },
  { href: "/admin/portfolio" as const, label: "Портфолио", icon: Briefcase, badge: null },
  { href: "/admin/clients" as const, label: "Клиенты", icon: UserCircle, badge: null },
  { href: "/admin/partners" as const, label: "Партнёры", icon: Handshake, badge: null },
  { href: "/admin/developers" as const, label: "Разработчики", icon: Users, badge: null },
  { href: "/admin/payouts" as const, label: "Оплаты", icon: Wallet, badge: "payouts" as const },
  { href: "/admin/knowledge" as const, label: "База знаний", icon: BookOpen, badge: null },
  { href: "/admin/settings" as const, label: "Настройки", icon: Settings, badge: null },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const [requestCount, setRequestCount] = useState(0);
  const [payoutCount, setPayoutCount] = useState(0);
  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        const count = data.filter((r: { status?: string }) => !r.status || r.status === "new").length;
        setRequestCount(count);
      })
      .catch(() => {});
    fetch("/api/admin/payouts")
      .then((res) => (res.ok ? res.json() : { payouts: [], milestones: [] }))
      .then((d) => {
        type R = { status?: string };
        const list1: R[] = Array.isArray(d.payouts) ? d.payouts : [];
        const list2: R[] = Array.isArray(d.milestones) ? d.milestones : [];
        const c = list1.filter((p) => p.status === "requested").length + list2.filter((m) => m.status === "requested").length;
        setPayoutCount(c);
      })
      .catch(() => {});
  }, []);

  // Закрывать drawer при смене страницы
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = ({ asMobile = false }: { asMobile?: boolean }) => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-faint">
        {(!collapsed || asMobile) && (
          <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
        )}
        {asMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 rounded-md border border-border-faint flex items-center justify-center hover:bg-surface-raised transition-colors flex-shrink-0"
            aria-label="Закрыть меню"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-md border border-border-faint flex items-center justify-center hover:bg-surface-raised transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-text-muted" /> : <ChevronLeft className="w-3.5 h-3.5 text-text-muted" />}
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="px-2 pt-3">
        <NotificationBell role="admin" collapsed={asMobile ? false : collapsed} />
      </div>

      {/* Section label */}
      {(!collapsed || asMobile) && (
        <div className="px-4 pt-3 pb-1">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Управление</span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const showCollapsed = collapsed && !asMobile;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive ? "bg-brand-500/10 text-brand-500" : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              } ${showCollapsed ? "justify-center" : ""}`}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"}`} />
              {!showCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge === "new" && requestCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold">{requestCount}</span>
                  )}
                  {item.badge === "payouts" && payoutCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">{payoutCount}</span>
                  )}
                </>
              )}
              {showCollapsed && item.badge === "new" && requestCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
              {showCollapsed && item.badge === "payouts" && payoutCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-faint p-2 space-y-1">
        <ThemeToggleButton collapsed={asMobile ? false : collapsed} />
        <button
          onClick={() => {
            document.cookie = "admin_session=; path=/; max-age=0";
            window.location.href = "/admin/login";
          }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-red-400 hover:bg-red-500/5 transition-all w-full ${
            collapsed && !asMobile ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {(!collapsed || asMobile) && <span>Выход</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-shrink-0 h-full border-r border-border-faint bg-surface flex-col transition-all duration-300 ${
          collapsed ? "w-[60px]" : "w-[240px]"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-surface border-r border-border-faint flex flex-col z-50 lg:hidden"
            >
              <SidebarContent asMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-border-faint bg-surface/95 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg border border-border-faint flex items-center justify-center hover:bg-bg-secondary transition-colors"
            aria-label="Открыть меню"
          >
            <Menu className="w-4 h-4 text-text-muted" />
          </button>
          <div className="text-sm font-semibold">Admin</div>
          <NotificationBell role="admin" collapsed />
        </div>

        {children}
      </main>
    </div>
  );
}
