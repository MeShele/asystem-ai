import type { Metadata } from "next";

const T: Record<string, { title: string; description: string }> = {
  ru: {
    title: "Заявка на проект · asystem.ai",
    description:
      "6 вопросов — и вы знаете цену проекта. Без созвонов и предоплаты. КП в течение 24 часов от независимой AI-first IT-студии asystem.ai (Бишкек, СНГ).",
  },
  kg: {
    title: "Долбоорго заявка · asystem.ai",
    description:
      "6 суроо — жана сиз баасын билесиз. Чалуу да, аванс да жок. 24 саат ичинде КП asystem.ai студиясынан.",
  },
  en: {
    title: "Project request · asystem.ai",
    description:
      "Six questions and you know the price. No calls, no upfront payment. Proposal within 24 hours from asystem.ai — independent AI-first studio (Bishkek, CIS).",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tr = T[locale] ?? T.ru;
  const canonical = `https://asystem.ai/${locale}/client/request`;

  return {
    title: tr.title,
    description: tr.description,
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
      title: tr.title,
      description: tr.description,
      url: canonical,
      siteName: "asystem.ai",
      locale,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: tr.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tr.title,
      description: tr.description,
      images: ["/opengraph-image"],
    },
  };
}

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
