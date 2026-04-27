"use client";

import { useTranslations } from "next-intl";
import { contactMethods } from "@/lib/validations/request";
import { Phone, MessageCircle, Send, Mail } from "lucide-react";
import type { RequestFormData } from "@/lib/validations/request";

interface Props {
  data: Partial<RequestFormData>;
  onChange: (v: Partial<RequestFormData>) => void;
}

type LucideIconProps = { size?: number; strokeWidth?: number; style?: React.CSSProperties; className?: string };

const contactIcons: Record<string, React.ComponentType<LucideIconProps>> = {
  phoneCall: Phone,
  whatsapp: MessageCircle,
  telegramContact: Send,
  emailContact: Mail,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 0",
  borderBottom: "1px solid #e5e5e5",
  background: "transparent",
  fontSize: "16px",
  color: "#0a0a0a",
  outline: "none",
  transition: "border-color 180ms ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono, monospace)",
  fontSize: "11px",
  color: "#9ca3af",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

export function StepContact({ data, onChange }: Props) {
  const t = useTranslations("quiz.step5");

  return (
    <div>
      <div className="flex flex-col gap-8">
        <Field label={`${t("name")} · обязательно`}>
          <input
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
            type="text"
            placeholder="Как к вам обращаться"
            value={data.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </Field>

        <Field label={t("company")}>
          <input
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#2563EB")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
            type="text"
            placeholder="Название компании"
            value={data.company || ""}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label={`${t("phone")} · обязательно`}>
            <input
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#2563EB")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
              type="tel"
              placeholder="+996 ___ ___ ___"
              value={data.phone || ""}
              onChange={(e) => onChange({ phone: e.target.value })}
            />
          </Field>
          <Field label={t("email")}>
            <input
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#2563EB")}
              onBlur={(e) => (e.currentTarget.style.borderBottomColor = "#e5e5e5")}
              type="email"
              placeholder="name@company.kg"
              value={data.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
            />
          </Field>
        </div>

        <Field label={`${t("preferredContact")} · обязательно`}>
          <div className="flex flex-wrap gap-px mt-2" style={{ background: "#e5e5e5" }}>
            {contactMethods.map((method) => {
              const Icon = contactIcons[method];
              const selected = data.preferredContact === method;
              return (
                <button
                  key={method}
                  onClick={() => onChange({ preferredContact: method })}
                  className="px-5 py-3 flex items-center gap-2 transition-all"
                  style={{
                    background: selected ? "#0a0a0a" : "#fff",
                    color: selected ? "#fff" : "#0a0a0a",
                  }}
                >
                  {Icon && <Icon size={16} strokeWidth={1.5} />}
                  <span className="text-[13px] font-medium">{t(method)}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}
