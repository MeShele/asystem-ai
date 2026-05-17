"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { MobileTopBar } from "@/components/shared/mobile-topbar";
import { VinylEasterEgg } from "@/components/shared/vinyl-easter-egg";
import { ArrowLeft } from "lucide-react";

export interface ProjectsShellCategory {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  locale: "ru" | "kg" | "en";
  totalCount: number;
  categories: ProjectsShellCategory[];
  uncategorizedCount: number;
  backLabel: string;
  allLabel: string;
  uncategorizedLabel: string;
  children: React.ReactNode;
}

export function ProjectsShell({
  locale,
  totalCount,
  categories,
  uncategorizedCount,
  backLabel,
  allLabel,
  uncategorizedLabel,
  children,
}: Props) {
  const mobileNav = [
    {
      title: "Категории",
      items: [
        { label: `${allLabel} · ${totalCount}`, href: "#all" },
        ...categories.filter((c) => c.count > 0).map((c) => ({ label: `${c.name} · ${c.count}`, href: `#cat-${c.slug}` })),
        ...(uncategorizedCount > 0 ? [{ label: `${uncategorizedLabel} · ${uncategorizedCount}`, href: "#cat-none" }] : []),
      ],
    },
    {
      title: "Site",
      items: [
        { label: backLabel, href: "/" },
        { label: "основателям", href: "/startups" },
        { label: "заявка", href: "/client/request" },
      ],
    },
    {
      title: "Contact",
      items: [
        { label: "hello@asystem.ai", href: "mailto:hello@asystem.ai", external: true },
        { label: "Telegram", href: "https://t.me/asystem_ai", external: true },
      ],
    },
  ];

  return (
    <>
      <MobileTopBar groups={mobileNav} />
      <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#fff", color: "#0a0a0a" }}>
        <aside
          className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-8 lg:py-12 lg:flex-col lg:gap-10"
          style={{ borderRight: "1px solid #e5e5e5", background: "#fff" }}
        >
          <Link href="/" className="inline-flex items-baseline gap-1 group" aria-label="asystem.ai">
            <span className="text-[22px] font-semibold tracking-tight">asystem</span>
            <span className="text-[22px] font-semibold" style={{ color: "#2563EB" }}>.</span>
            <span className="text-[22px] font-semibold tracking-tight">ai</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-mono transition-colors hover:text-[#2563EB]"
            style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
          >
            <ArrowLeft className="w-3 h-3" /> {backLabel}
          </Link>

          <SidebarGroup title={`Категории · ${totalCount}`}>
            <SidebarItem href="#all">{allLabel} · <span className="font-mono text-[#9ca3af]">{totalCount}</span></SidebarItem>
            {categories.filter((c) => c.count > 0).map((c) => (
              <SidebarItem key={c.slug} href={`#cat-${c.slug}`}>
                {c.name} · <span className="font-mono text-[#9ca3af]">{c.count}</span>
              </SidebarItem>
            ))}
            {uncategorizedCount > 0 && (
              <SidebarItem href="#cat-none">
                {uncategorizedLabel} · <span className="font-mono text-[#9ca3af]">{uncategorizedCount}</span>
              </SidebarItem>
            )}
          </SidebarGroup>

          <SidebarGroup title="Site">
            <SidebarItem href="/startups">основателям</SidebarItem>
            <SidebarItem href="/partner">партнёрам</SidebarItem>
            <SidebarItem href="/client/request">заявка</SidebarItem>
          </SidebarGroup>

          <SidebarGroup title="Contact">
            <SidebarItem href="mailto:hello@asystem.ai" external>hello@asystem.ai</SidebarItem>
            <SidebarItem href="https://t.me/asystem_ai" external>Telegram</SidebarItem>
            <SidebarItem href="https://wa.me/996" external>WhatsApp</SidebarItem>
          </SidebarGroup>

          <SidebarGroup title="Language">
            <div className="flex items-center gap-3 font-mono text-[12px]" style={{ color: "#0a0a0a" }}>
              <span style={{ color: locale === "ru" ? "#0a0a0a" : "#9ca3af" }}>RU</span>
              <span style={{ color: "#d4d4d4" }}>·</span>
              <span style={{ color: locale === "kg" ? "#0a0a0a" : "#9ca3af" }}>KG</span>
              <span style={{ color: "#d4d4d4" }}>·</span>
              <span style={{ color: locale === "en" ? "#0a0a0a" : "#9ca3af" }}>EN</span>
            </div>
          </SidebarGroup>

          <div className="mt-auto pt-10">
            <LiveTimestamp />
            <div className="mt-4 font-mono text-[10px]" style={{ color: "#9ca3af", letterSpacing: "0.1em" }}>
              © 2026 · BISHKEK, KG
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {children}

          {/* Easter egg (внутри уже есть свой wordmark «asystem.ai» с яйцом-точкой) */}
          <VinylEasterEgg />
        </main>
      </div>
    </>
  );
}

function SidebarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav>
      <div
        className="font-mono text-[10px] mb-3"
        style={{ color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        {title}
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </nav>
  );
}

function SidebarItem({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const inner = (
    <span
      className="text-[14px] transition-colors hover:text-[#2563EB] inline-flex items-baseline"
      style={{ color: "#0a0a0a" }}
    >
      {children}
    </span>
  );
  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return <li><a href={href} target={external ? "_blank" : undefined} rel="noopener noreferrer">{inner}</a></li>;
  }
  if (href.startsWith("#")) {
    return <li><a href={href}>{inner}</a></li>;
  }
  return <li><Link href={href}>{inner}</Link></li>;
}

function LiveTimestamp() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setNow(`BISHKEK · ${hh}:${mm}`);
    };
    fmt();
    const t = setInterval(fmt, 30_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return null;
  return (
    <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "#0a0a0a", letterSpacing: "0.08em" }}>
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)" }} />
      <span>{now}</span>
    </div>
  );
}

