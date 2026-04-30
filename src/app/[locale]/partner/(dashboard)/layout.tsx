"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Trophy,
  BookOpen,
  Wallet,
  Network,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";
import { NotificationBell } from "@/components/shared/notification-bell";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/partner/dashboard" as const, label: "Дашборд", icon: LayoutDashboard },
  { href: "/partner/projects" as const, label: "Проекты", icon: FolderKanban },
  { href: "/partner/network" as const, label: "Мои партнёры", icon: Network },
  { href: "/partner/payouts" as const, label: "Выплаты", icon: Wallet },
  { href: "/partner/achievements" as const, label: "Достижения", icon: Trophy },
  { href: "/partner/knowledge" as const, label: "База знаний", icon: BookOpen },
  { href: "/partner/settings" as const, label: "Настройки", icon: Settings },
];

// Items для bottom-nav на мобильном — самые частые 5
const bottomNavItems = navItems.slice(0, 5);

export default function PartnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const pathname = usePathname();
  const [partnerName, setPartnerName] = useState("");

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.partner?.name) setPartnerName(data.partner.name);
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
          <div className="min-w-0">
            <span className="text-sm font-semibold text-text-primary block truncate">
              {partnerName || "Партнёр"}
            </span>
            <span className="text-[10px] text-text-muted">Партнёрская панель</span>
          </div>
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
        <NotificationBell role="partner" collapsed={asMobile ? false : collapsed} />
      </div>

      {/* Section label */}
      {(!collapsed || asMobile) && (
        <div className="px-4 pt-3 pb-1">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
            Навигация
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-brand-500/10 text-brand-500"
                  : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
              } ${collapsed && !asMobile ? "justify-center" : ""}`}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${
                  isActive ? "text-brand-500" : "text-text-muted group-hover:text-text-secondary"
                }`}
              />
              {(!collapsed || asMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border-faint p-2 space-y-1">
        <ThemeToggleButton collapsed={asMobile ? false : collapsed} />
        <button
          onClick={async () => {
            await fetch("/api/partner/login", { method: "DELETE" });
            document.cookie = "partner_session=; path=/; max-age=0";
            const locale = window.location.pathname.split("/")[1] || "ru";
            window.location.href = `/${locale}/partner/login`;
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
      {/* Desktop sidebar (hidden on mobile) */}
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
      <main className="flex-1 min-w-0 overflow-auto pb-16 lg:pb-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-border-faint bg-surface/95 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg border border-border-faint flex items-center justify-center hover:bg-bg-secondary transition-colors"
            aria-label="Открыть меню"
          >
            <Menu className="w-4 h-4 text-text-muted" />
          </button>
          <div className="text-sm font-semibold truncate">{partnerName || "Партнёр"}</div>
          <NotificationBell role="partner" collapsed />
        </div>

        {children}
      </main>

      {/* Mobile bottom-nav (5 main items) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-sm border-t border-border-faint flex items-stretch h-16">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
                isActive ? "text-brand-500" : "text-text-muted"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
              <span className="text-[10px] font-medium leading-none truncate max-w-full px-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
