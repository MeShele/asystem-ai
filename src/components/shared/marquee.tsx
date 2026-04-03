"use client";

const TECHS = [
  "Next.js", "React", "TypeScript", "PostgreSQL", "Prisma",
  "Telegram API", "Docker", "Tailwind CSS", "Redis",
  "Kubernetes", "GitHub Actions", "AI / GPT-4", "Blockchain",
  "Framer Motion", "Playwright", "REST API", "WebSocket", "Vercel",
];

export function TechMarquee() {
  const items = [...TECHS, ...TECHS];

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      <div className="fc-container">
        <div className="absolute top-0 left-0 right-0 bottom-0 border-x border-border-faint pointer-events-none" />
        <div className="h-px bg-border-faint" />
        <div className="text-center mb-10 pt-4">
          <span className="text-xs text-text-muted tracking-[0.2em] uppercase">Tech Stack</span>
        </div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4 mb-4 animate-marquee">
        {items.map((tech, i) => (
          <span
            key={`a-${i}`}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-border-faint bg-surface text-sm text-text-secondary hover:text-brand-500 hover:border-brand-500/30 transition-all duration-300 whitespace-nowrap font-medium"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-4 animate-marquee-reverse">
        {[...items].reverse().map((tech, i) => (
          <span
            key={`b-${i}`}
            className="flex-shrink-0 px-5 py-2.5 rounded-xl border border-border-faint bg-surface text-sm text-text-secondary hover:text-accent-500 hover:border-accent-500/30 transition-all duration-300 whitespace-nowrap font-medium"
          >
            {tech}
          </span>
        ))}
      </div>
    </section>
  );
}
