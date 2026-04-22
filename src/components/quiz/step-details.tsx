"use client";

import { useTranslations } from "next-intl";

interface Props {
  serviceType: string;
  details: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 0",
  borderBottom: "1px solid #e5e5e5",
  background: "transparent",
  fontSize: "16px",
  color: "#0a0a0a",
  outline: "none",
  transition: "border-color 180ms ease",
  fontFamily: "inherit",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "11px",
  color: "#9ca3af",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "10px",
};

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 transition-all duration-200"
      style={{
        background: active ? "#0a0a0a" : "#fff",
        color: active ? "#fff" : "#0a0a0a",
        border: "1px solid #e5e5e5",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

export function StepDetails({ serviceType, details, onChange }: Props) {
  const t = useTranslations("quiz.step2");

  function set(key: string, val: string) {
    onChange({ ...details, [key]: val });
  }

  return (
    <div>
      <div className="flex flex-col gap-8">
        {serviceType === "website" && (
          <>
            <div>
              <label style={labelStyle}>{t("websiteType")}</label>
              <div className="flex flex-wrap gap-2">
                {["landing", "corporate", "ecommerce"].map((v) => (
                  <Pill key={v} active={details.websiteType === v} onClick={() => set("websiteType", v)}>
                    {t(v)}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t("hasDesign")}</label>
              <div className="flex gap-2">
                {["yes", "no"].map((v) => (
                  <Pill key={v} active={details.hasDesign === v} onClick={() => set("hasDesign", v)}>
                    {t(v)}
                  </Pill>
                ))}
              </div>
            </div>
          </>
        )}

        {serviceType === "bot" && (
          <>
            <div>
              <label style={labelStyle}>{t("botPlatform")}</label>
              <div className="flex flex-wrap gap-2">
                {["telegram", "whatsapp", "other"].map((v) => (
                  <Pill key={v} active={details.botPlatform === v} onClick={() => set("botPlatform", v)}>
                    {t(v)}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t("botFunction")}</label>
              <textarea
                style={inputStyle}
                rows={3}
                value={details.botFunction || ""}
                onChange={(e) => set("botFunction", e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#ef4444")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
              />
            </div>
          </>
        )}

        {serviceType === "app" && (
          <>
            <div>
              <label style={labelStyle}>{t("appPlatform")}</label>
              <div className="flex flex-wrap gap-2">
                {["ios", "android", "both"].map((v) => (
                  <Pill key={v} active={details.appPlatform === v} onClick={() => set("appPlatform", v)}>
                    {t(v)}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t("appDesc")}</label>
              <textarea
                style={inputStyle}
                rows={3}
                value={details.appDesc || ""}
                onChange={(e) => set("appDesc", e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#ef4444")}
                onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
              />
            </div>
          </>
        )}

        {serviceType === "automation" && (
          <div>
            <label style={labelStyle}>{t("automationDesc")}</label>
            <textarea
              style={inputStyle}
              rows={4}
              value={details.automationDesc || ""}
              onChange={(e) => set("automationDesc", e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#ef4444")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
            />
          </div>
        )}

        {serviceType === "custom" && (
          <div>
            <label style={labelStyle}>{t("customDesc")}</label>
            <textarea
              style={inputStyle}
              rows={4}
              value={details.customDesc || ""}
              onChange={(e) => set("customDesc", e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#ef4444")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
            />
          </div>
        )}

        <div>
          <label style={labelStyle}>{t("examples")}</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="https://..."
            value={details.examples || ""}
            onChange={(e) => set("examples", e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#ef4444")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
          />
        </div>
      </div>
    </div>
  );
}
