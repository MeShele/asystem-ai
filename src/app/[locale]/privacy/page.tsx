import type { Metadata } from "next";
import { PrivacyWall } from "@/components/legal/privacy-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "privacy");
}

export default function PrivacyPage() {
  return <PrivacyWall />;
}
