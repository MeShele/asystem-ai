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
  const isClientPanel = pathname.includes("/client/") && !pathname.match(/^\/(ru|en|kg)\/client\/request\/?$/);
  const isPartnerLanding = /^\/(ru|en|kg)\/partner\/?$/.test(pathname);
  const isStartupsLanding = /^\/(ru|en|kg)\/startups\/?$/.test(pathname);
  const isQuizPage = /^\/(ru|en|kg)\/client\/request\/?$/.test(pathname);
  const isSplash = /^\/(ru|en|kg)?\/?$/.test(pathname);
  const isTelegramMiniApp = /^\/(ru|en|kg)\/tg(\/|$)/.test(pathname);

  if (isAdmin || isPartnerPanel || isClientPanel || isSplash || isPartnerLanding || isStartupsLanding || isQuizPage || isTelegramMiniApp) {
    // Home (splash) и admin/partner/startups panels рендерят свой layout
    return <>{children}</>;
  }

  return (
    <>
      <ParticlesBg />
      <NoiseGrain />
      <Navbar />
      <main id="main-content" className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}
