import type { Metadata } from "next";
import { WorksWall } from "@/components/landing/works-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "home");
}

export default function HomePage() {
  return <WorksWall />;
}
