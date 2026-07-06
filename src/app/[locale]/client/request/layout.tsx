import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.clientRequest" });
  const title = t("title");
  const description = t("description");
  const canonical = `https://asystem.ai/${locale}/client/request`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ru: "https://asystem.ai/ru/client/request",
        kg: "https://asystem.ai/kg/client/request",
        en: "https://asystem.ai/en/client/request",
        "x-default": "https://asystem.ai/ru/client/request",
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asystem.ai",
      locale,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
