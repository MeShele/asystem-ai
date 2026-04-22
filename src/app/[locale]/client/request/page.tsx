"use client";

import { QuizForm } from "@/components/quiz/quiz-form";
import { Link } from "@/i18n/navigation";

export default function RequestPage() {
  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: "#fff", color: "#0a0a0a" }}
    >
      {/* Sidebar */}
      <aside
        className="lg:w-[300px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto px-6 lg:px-8 py-8 lg:py-12 flex flex-col gap-10"
        style={{ borderRight: "1px solid #e5e5e5", background: "#fafafa" }}
      >
        <Link href="/" className="inline-flex items-baseline gap-1">
          <span className="text-[22px] font-semibold tracking-tight">asystem</span>
          <span className="text-[22px] font-semibold" style={{ color: "#ef4444" }}>.</span>
          <span className="text-[22px] font-semibold tracking-tight">ai</span>
          <span
            className="ml-2 font-mono text-[10px]"
            style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
          >
            / заявка
          </span>
        </Link>

        <div>
          <div
            className="font-mono text-[10px] mb-3"
            style={{ color: "#9ca3af", letterSpacing: "0.15em", textTransform: "uppercase" }}
          >
            Quiz
          </div>
          <h1
            className="font-semibold tracking-tight mb-4"
            style={{ fontSize: "1.5rem", lineHeight: 1.15 }}
          >
            Шесть вопросов — <br />
            <span style={{ color: "#ef4444" }}>и вы знаете цену</span>.
          </h1>
          <p className="text-[14px]" style={{ color: "#525252", lineHeight: 1.55 }}>
            Без созвонов, без предоплаты. Расчёт за 3 минуты —
            дальше ответим с КП в течение 24 часов.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Guarantee label="MVP без предоплаты" />
          <Guarantee label="Фиксированная цена" />
          <Guarantee label="Код ваш с первого дня" />
          <Guarantee label="Отвечаем за результат" />
        </div>

        <div className="mt-auto pt-10">
          <Link
            href="/"
            className="font-mono text-[12px] inline-flex items-center gap-2 transition-colors"
            style={{ color: "#525252", letterSpacing: "0.05em" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#ef4444")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#525252")}
          >
            ← на главную
          </Link>
          <div
            className="mt-3 font-mono text-[10px]"
            style={{ color: "#9ca3af", letterSpacing: "0.1em" }}
          >
            © 2026 · BISHKEK, KG
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-6 lg:px-16 py-16 lg:py-24">
        <QuizForm />
      </main>
    </div>
  );
}

function Guarantee({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: "#10b981" }}
      />
      <span className="text-[13px]" style={{ color: "#0a0a0a" }}>
        {label}
      </span>
    </div>
  );
}
