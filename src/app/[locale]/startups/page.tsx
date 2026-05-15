import type { Metadata } from "next";
import { StartupsWall } from "@/components/startups/startups-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "startups");
}

export default function StartupsPage() {
  return <StartupsWall />;
}
