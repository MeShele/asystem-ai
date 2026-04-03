"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { StepServiceType } from "./step-service-type";
import { StepDetails } from "./step-details";
import { StepTimeline } from "./step-timeline";
import { StepBudget } from "./step-budget";
import { StepContact } from "./step-contact";
import type { RequestFormData } from "@/lib/validations/request";

const TOTAL_STEPS = 5;

export function QuizForm() {
  const t = useTranslations("quiz");
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<Partial<RequestFormData>>({});
  const [requestId, setRequestId] = useState('');
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
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ref: refCode }),
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const { requestId: id } = await response.json();
      setRequestId(id);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit failed:', err);
      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        className="text-center py-20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-3xl font-bold mb-3">{t("success.title")}</h2>
        <p className="text-text-secondary text-lg mb-6">{t("success.subtitle")}</p>
        <p className="font-mono text-brand-400 text-sm mb-8">
          {t("success.number")}: {requestId}
        </p>
        <a
          href="/"
          className="fc-button-primary inline-flex px-8 py-3"
        >
          <span>{t("success.back")}</span>
        </a>
      </motion.div>
    );
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -100 : 100, opacity: 0 }),
  };

  const canNext =
    (step === 1 && data.serviceType) ||
    step === 2 ||
    (step === 3 && data.timeline) ||
    (step === 4 && data.budget) ||
    (step === 5 && data.name && data.phone && data.preferredContact);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">{t("title")}</h1>
      <p className="text-center text-text-secondary mb-10">
        {t("step", { current: step, total: TOTAL_STEPS })}
      </p>

      {/* Progress bar */}
      <div className="h-[2px] bg-border-faint rounded-full mb-10 overflow-hidden">
        <motion.div
          className="h-full bg-brand-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
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
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 1 && <StepServiceType value={data.serviceType} onChange={(v) => updateData({ serviceType: v })} />}
          {step === 2 && <StepDetails serviceType={data.serviceType!} details={(data.details || {}) as Record<string, string>} onChange={(v) => updateData({ details: v })} />}
          {step === 3 && <StepTimeline value={data.timeline} onChange={(v) => updateData({ timeline: v })} />}
          {step === 4 && <StepBudget value={data.budget} onChange={(v) => updateData({ budget: v })} />}
          {step === 5 && <StepContact data={data} onChange={updateData} />}
        </motion.div>
      </AnimatePresence>

      {submitError && (
        <div className="mt-4 text-sm text-red-500 text-center">{submitError}</div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <button
          onClick={back}
          disabled={step === 1}
          aria-label="Назад"
          className="fc-button-secondary px-6 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← {t("back")}
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={next}
            disabled={!canNext}
            aria-label="Далее"
            className="fc-button-primary px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{t("next")} →</span>
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!canNext || isSubmitting}
            aria-label="Отправить заявку"
            className="fc-button-primary px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? '...' : `${t("submit")} ✓`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
