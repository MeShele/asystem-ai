import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "asystem.ai — Независимая AI-first IT-студия";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #2563EB 0%, #1D4ED8 60%, #1E40AF 100%)",
          color: "#ffffff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "4px",
            fontSize: "44px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <span>asystem</span>
          <span style={{ color: "#fafafa", opacity: 0.95 }}>.</span>
          <span>ai</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              maxWidth: "1000px",
            }}
          >
            Независимая AI-first IT-студия из Бишкека
          </div>
          <div
            style={{
              fontSize: "26px",
              opacity: 0.85,
              maxWidth: "880px",
              lineHeight: 1.35,
            }}
          >
            AI-решения и веб-платформы для бизнеса СНГ · 4× быстрее · 0 ₽ предоплаты · FIX-цена
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          <span>asystem.ai</span>
          <span>BISHKEK · KG</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
