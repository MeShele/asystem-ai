import type { Metadata } from "next";
import { PartnerWall } from "@/components/partner/partner-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { partnerFaqSchema } from "@/lib/seo/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "partner");
}

export default function PartnerPage() {
  return (
    <>
      <JsonLd data={partnerFaqSchema} />
      <PartnerWall />
    </>
  );
}
