import type { Metadata } from "next";
import { TermsWall } from "@/components/legal/terms-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "terms");
}

export default function TermsPage() {
  return <TermsWall />;
}
