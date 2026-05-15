import type { Metadata } from "next";
import { ProductsWall } from "@/components/products/products-wall";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata(locale, "products");
}

export default function ProductsPage() {
  return <ProductsWall />;
}
