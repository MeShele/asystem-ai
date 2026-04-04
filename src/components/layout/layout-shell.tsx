"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

const ParticlesBg = dynamic(
  () => import("@/components/splash/particles-bg").then((m) => m.ParticlesBg),
  { ssr: false }
);
const NoiseGrain = dynamic(
  () => import("@/components/shared/decorations").then((m) => m.NoiseGrain),
  { ssr: false }
);

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isPartnerPanel = pathname.includes("/partner/") && !pathname.match(/^\/(ru|en|kg)\/partner\/?$/);
  const isSplash = /^\/(ru|en|kg)?\/?$/.test(pathname);

  if (isAdmin || isPartnerPanel) {
    return <>{children}</>;
  }

  return (
    <>
      {!isSplash && <ParticlesBg />}
      <NoiseGrain />
      <Navbar />
      <main id="main-content" className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}
