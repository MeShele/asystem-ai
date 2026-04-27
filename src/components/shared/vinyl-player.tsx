"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { VinylRecord } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

export function VinylPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controls = useAnimationControls();

  useEffect(() => {
    if (playing) {
      controls.start({
        rotate: 360,
        transition: { duration: 4, ease: "linear", repeat: Infinity },
      });
    } else {
      controls.stop();
    }
  }, [playing, controls]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${ss}`;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section
      id="soundtrack"
      className="relative overflow-hidden px-6 lg:px-12 py-20 lg:py-28"
      style={{ background: "#fafafa", color: "#0a0a0a", borderTop: "1px solid #e5e5e5" }}
    >
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Vinyl — Phosphor duotone icon, rotates on play */}
        <div className="lg:col-span-5 flex items-center justify-center lg:justify-start">
          <div
            className="relative"
            style={{
              width: "min(88vw, 460px)",
              aspectRatio: "1 / 1",
              filter: "drop-shadow(0 40px 80px rgba(37, 99, 235,0.35)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
            }}
          >
            <motion.div
              animate={controls}
              initial={{ rotate: 0 }}
              style={{ width: "100%", height: "100%", color: "#0f0f0f" }}
            >
              <VinylRecord
                size="100%"
                weight="duotone"
                style={{ width: "100%", height: "100%" }}
              />
            </motion.div>
            {/* Center label overlay */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "36%" }}
            >
              <motion.div
                animate={controls}
                initial={{ rotate: 0 }}
                className="aspect-square rounded-full flex flex-col items-center justify-center"
                style={{
                  background: "#2563EB",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25), 0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className="font-semibold tracking-tight text-center leading-tight"
                  style={{ fontSize: "clamp(10px, 1.1vw, 14px)", color: "#fff", padding: "0 14%" }}
                >
                  CASHFLOW
                  <br />
                  GLITCH
                </div>
                <div
                  className="font-mono mt-1"
                  style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.15em" }}
                >
                  ASYSTEM · 2026
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Meta + controls */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          <div
            className="font-mono text-[10px] flex items-center gap-3"
            style={{ color: "#525252", letterSpacing: "0.25em" }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#2563EB" }}
            />
            SOUNDTRACK · SIDE A · SUNO.AI
          </div>

          <h2
            className="font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-display, 'Space Grotesk'), sans-serif",
              fontSize: "clamp(36px, 5vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            Cashflow
            <br />
            <span style={{ color: "#2563EB" }}>Glitch.</span>
          </h2>

          <p
            className="max-w-xl text-[15px] lg:text-[17px]"
            style={{ color: "rgba(10,10,10,0.65)", lineHeight: 1.55 }}
          >
            Внутренний трек студии. Сделан в Suno AI. Посвящение тем, кто считает
            что «прозрачная цена» и «без предоплаты» — маркетинг, а не оффер.
          </p>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Пауза" : "Играть"}
              className="inline-flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                width: 68,
                height: 68,
                background: "#2563EB",
                color: "#fff",
                boxShadow: playing
                  ? "0 0 0 6px rgba(37, 99, 235,0.18), 0 10px 30px -10px rgba(37, 99, 235,0.6)"
                  : "0 10px 30px -10px rgba(37, 99, 235,0.4)",
              }}
            >
              {playing ? <Pause size={22} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: 3 }} />}
            </button>

            <div className="flex-1 flex flex-col gap-2">
              <div
                className="relative h-[3px] w-full overflow-hidden"
                style={{ background: "rgba(10,10,10,0.08)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 transition-[width] duration-300"
                  style={{ width: `${pct}%`, background: "#2563EB" }}
                />
              </div>
              <div
                className="font-mono text-[11px] flex items-center justify-between"
                style={{ color: "rgba(10,10,10,0.45)", letterSpacing: "0.1em" }}
              >
                <span>{fmt(time)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          </div>

          <div
            className="font-mono text-[10px] flex items-center gap-6 pt-4"
            style={{ color: "rgba(10,10,10,0.35)", letterSpacing: "0.2em", borderTop: "1px solid rgba(10,10,10,0.08)" }}
          >
            <span>BPM · ???</span>
            <span>KEY · UNDEFINED</span>
            <span>MOOD · ПЕТУШИНЫЙ</span>
          </div>

          <audio ref={audioRef} src="/audio/cashflow-glitch.mp3" preload="metadata" />
        </div>
      </div>
    </section>
  );
}
