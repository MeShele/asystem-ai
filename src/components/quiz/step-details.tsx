"use client";

import { useTranslations } from "next-intl";

interface Props {
  serviceType: string;
  details: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}

export function StepDetails({ serviceType, details, onChange }: Props) {
  const t = useTranslations("quiz.step2");

  function set(key: string, val: string) {
    onChange({ ...details, [key]: val });
  }

  const inputClass =
    "w-full p-3 bg-bg-primary border border-border-faint rounded-lg text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

  const radioClass = (active: boolean) =>
    `px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
      active
        ? "border-brand-500 bg-brand-500/[0.08] text-brand-400"
        : "border-border-faint bg-surface text-text-secondary hover:border-border-muted hover:bg-surface-raised"
    }`;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("title")}</h2>
      <div className="space-y-5">
        {serviceType === "website" && (
          <>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("websiteType")}</label>
              <div className="flex flex-wrap gap-3">
                {["landing", "corporate", "ecommerce"].map((v) => (
                  <button key={v} className={radioClass(details.websiteType === v)} onClick={() => set("websiteType", v)} aria-label={t(v)}>
                    {t(v)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("hasDesign")}</label>
              <div className="flex gap-3">
                {["yes", "no"].map((v) => (
                  <button key={v} className={radioClass(details.hasDesign === v)} onClick={() => set("hasDesign", v)} aria-label={t(v)}>
                    {t(v)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {serviceType === "bot" && (
          <>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("botPlatform")}</label>
              <div className="flex flex-wrap gap-3">
                {["telegram", "whatsapp", "other"].map((v) => (
                  <button key={v} className={radioClass(details.botPlatform === v)} onClick={() => set("botPlatform", v)} aria-label={t(v)}>
                    {t(v)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("botFunction")}</label>
              <textarea className={inputClass} rows={3} value={details.botFunction || ""} onChange={(e) => set("botFunction", e.target.value)} />
            </div>
          </>
        )}

        {serviceType === "app" && (
          <>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("appPlatform")}</label>
              <div className="flex flex-wrap gap-3">
                {["ios", "android", "both"].map((v) => (
                  <button key={v} className={radioClass(details.appPlatform === v)} onClick={() => set("appPlatform", v)} aria-label={t(v)}>
                    {t(v)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">{t("appDesc")}</label>
              <textarea className={inputClass} rows={3} value={details.appDesc || ""} onChange={(e) => set("appDesc", e.target.value)} />
            </div>
          </>
        )}

        {serviceType === "automation" && (
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t("automationDesc")}</label>
            <textarea className={inputClass} rows={4} value={details.automationDesc || ""} onChange={(e) => set("automationDesc", e.target.value)} />
          </div>
        )}

        {serviceType === "custom" && (
          <div>
            <label className="block text-sm text-text-secondary mb-2">{t("customDesc")}</label>
            <textarea className={inputClass} rows={4} value={details.customDesc || ""} onChange={(e) => set("customDesc", e.target.value)} />
          </div>
        )}

        <div>
          <label className="block text-sm text-text-secondary mb-2">{t("examples")}</label>
          <input className={inputClass} type="text" value={details.examples || ""} onChange={(e) => set("examples", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
