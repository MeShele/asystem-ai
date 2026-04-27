"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StepServiceType } from "./step-service-type";
import { StepDetails } from "./step-details";
import { StepTimeline } from "./step-timeline";
import { StepBudget } from "./step-budget";
import { StepContact } from "./step-contact";
import type { RequestFormData } from "@/lib/validations/request";

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  { kicker: "01", title: "Что нужно" },
  { kicker: "02", title: "Детали" },
  { kicker: "03", title: "Срок" },
  { kicker: "04", title: "Бюджет" },
  { kicker: "05", title: "Контакт" },
];

export function QuizForm() {
  const t = useTranslations("quiz");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<Partial<RequestFormData>>({});
  const [requestId, setRequestId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setRefCode(ref);
  }, []);

  function updateData(partial: Partial<RequestFormData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function back() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function submit() {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ref: refCode }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const { requestId: id } = await response.json();
      setRequestId(id);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        className="py-20 max-w-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="font-mono text-[11px] mb-6 inline-flex items-center gap-2"
          style={{ color: "#10b981", letterSpacing: "0.2em" }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.6)" }}
          />
          SUCCESS · SENT
        </div>
        <h2
          className="font-semibold tracking-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.05 }}
        >
          Заявка отправлена.
          <br />
          <span style={{ color: "#9ca3af" }}>Свяжемся в течение часа.</span>
        </h2>
        <p className="mt-6 text-[15px]" style={{ color: "#525252", lineHeight: 1.55 }}>
          В рабочее время Алматы (пн-пт, 10:00–19:00). Если позднее — ответим утром.
        </p>
        <div
          className="mt-10 px-6 py-4 font-mono text-[12px] inline-flex flex-col gap-1"
          style={{ border: "1px solid #e5e5e5", background: "#fafafa", letterSpacing: "0.1em" }}
        >
          <span style={{ color: "#9ca3af" }}>REQUEST ID</span>
          <span style={{ color: "#2563EB", fontSize: "14px" }}>{requestId}</span>
        </div>
        <div className="mt-10">
          <a
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3 transition-colors"
            style={{
              border: "1px solid #0a0a0a",
              color: "#0a0a0a",
              fontSize: "14px",
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#0a0a0a";
            }}
          >
            <ArrowLeft size={16} />
            На главную
          </a>
        </div>
      </motion.div>
    );
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const canNext =
    (step === 1 && data.serviceType) ||
    step === 2 ||
    (step === 3 && data.timeline) ||
    (step === 4 && data.budget) ||
    (step === 5 && data.name && data.phone && data.preferredContact);

  const currentStep = STEP_LABELS[step - 1];

  return (
    <div className="max-w-3xl">
      {/* Step progress */}
      <div className="mb-12">
        <div
          className="font-mono text-[11px] mb-3 flex items-center justify-between"
          style={{ color: "#9ca3af", letterSpacing: "0.2em" }}
        >
          <span>
            STEP · {step} / {TOTAL_STEPS}
          </span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-px"
              style={{ background: i < step ? "#2563EB" : "#e5e5e5" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            />
          ))}
        </div>
      </div>

      {/* Current step header */}
      <div className="mb-10">
        <div
          className="font-mono text-[11px] mb-3 inline-flex items-center gap-2"
          style={{ color: "#2563EB", letterSpacing: "0.2em" }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          {currentStep.kicker} / {currentStep.title.toUpperCase()}
        </div>
        <h2
          className="font-semibold tracking-tight"
          style={{
            fontSize: "clamp(1.5rem, 2.8vw, 2.25rem)",
            lineHeight: 1.1,
            color: "#0a0a0a",
          }}
        >
          {step === 1 && t("step1.title")}
          {step === 2 && t("step2.title")}
          {step === 3 && t("step3.title")}
          {step === 4 && t("step4.title")}
          {step === 5 && t("step5.title")}
        </h2>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 1 && <StepServiceType value={data.serviceType} onChange={(v) => updateData({ serviceType: v })} />}
          {step === 2 && (
            <StepDetails
              serviceType={data.serviceType!}
              details={(data.details || {}) as Record<string, string>}
              onChange={(v) => updateData({ details: v })}
            />
          )}
          {step === 3 && <StepTimeline value={data.timeline} onChange={(v) => updateData({ timeline: v })} />}
          {step === 4 && <StepBudget value={data.budget} onChange={(v) => updateData({ budget: v })} />}
          {step === 5 && <StepContact data={data} onChange={updateData} />}
        </motion.div>
      </AnimatePresence>

      {submitError && (
        <div
          className="mt-6 px-4 py-3 font-mono text-[12px]"
          style={{
            color: "#2563EB",
            border: "1px solid rgba(37, 99, 235,0.3)",
            background: "rgba(37, 99, 235,0.05)",
            letterSpacing: "0.05em",
          }}
        >
          ⚠ {submitError}
        </div>
      )}

      {/* Navigation */}
      <div
        className="mt-12 pt-8 flex items-center justify-between"
        style={{ borderTop: "1px solid #e5e5e5" }}
      >
        <button
          onClick={back}
          disabled={step === 1}
          aria-label={t("back")}
          className="inline-flex items-center gap-2 px-5 py-3 font-mono text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: "#525252",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) => {
            if (step !== 1) (e.currentTarget as HTMLElement).style.color = "#0a0a0a";
          }}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#525252")}
        >
          <ArrowLeft size={14} />
          {t("back")}
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={next}
            disabled={!canNext}
            aria-label={t("next")}
            className="inline-flex items-center gap-3 px-7 py-3.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "#2563EB",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (canNext) (e.currentTarget as HTMLElement).style.background = "#1D4ED8";
            }}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#2563EB")}
          >
            {t("next")}
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canNext || isSubmitting}
            aria-label={t("submit")}
            className="inline-flex items-center gap-3 px-7 py-3.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1D4ED8]"
            style={{
              background: "#2563EB",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {isSubmitting ? "Отправляем..." : t("submit")}
            {!isSubmitting && <Check size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
