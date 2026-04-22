import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { LayoutShell } from "@/components/layout/layout-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeModal } from "@/components/theme-modal";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://asystem.ai"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: "asystem.ai",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: `https://asystem.ai/${locale}`,
      languages: {
        ru: "https://asystem.ai/ru",
        en: "https://asystem.ai/en",
        kg: "https://asystem.ai/kg",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('asystem_theme');
                  if (!theme) {
                    localStorage.setItem('asystem_theme', 'light');
                    theme = 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-bg-card focus:text-text-primary focus:rounded-lg focus:border focus:border-border-muted focus:text-sm focus:font-medium focus:shadow-lg">
          Skip to main content
        </a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>
            <ThemeModal />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
