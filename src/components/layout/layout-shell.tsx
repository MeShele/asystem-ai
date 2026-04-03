"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ParticlesBg } from "@/components/splash/particles-bg";
import { NoiseGrain } from "@/components/shared/decorations";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes("/admin");
  const isSplash = /^\/(ru|en|kg)?\/?$/.test(pathname);

  if (isAdmin) {
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
