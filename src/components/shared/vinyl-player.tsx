"use client";

import { motion, useAnimationControls } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { VinylRecord } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

const WAVE_BARS = 56;
// Pre-deterministic heights for waveform (so server/client match without random mismatch)
const WAVE_HEIGHTS = Array.from({ length: WAVE_BARS }, (_, i) => {
  const seed = Math.sin(i * 1.21 + 3.7) * 0.5 + 0.5;
  const env = 0.3 + 0.7 * Math.sin((i / WAVE_BARS) * Math.PI);
  return Math.max(0.18, Math.min(1, seed * env + 0.1));
});

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
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <section
      id="soundtrack"
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(37,99,235,0.22), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(29,78,216,0.18), transparent 60%), linear-gradient(160deg, #060d24 0%, #0b1740 55%, #0a1330 100%)",
        color: "#fff",
      }}
    >
      {/* Top header */}
      <div
        className="flex items-center justify-between px-6 lg:px-12 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
      >
        <div className="inline-flex items-center gap-3">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: "#2563EB", boxShadow: "0 0 14px rgba(37,99,235,0.8)" }}
          />
          <span
            className="font-mono font-semibold text-[12px] lg:text-[13px]"
            style={{ color: "rgba(255,255,255,0.92)", letterSpacing: "0.28em" }}
          >
            ASYSTEM · ORIGINAL SOUNDTRACK · VOL.1
          </span>
        </div>
        <span
          className="font-mono font-semibold text-[12px] lg:text-[13px]"
          style={{ color: "rgba(147,197,253,0.95)", letterSpacing: "0.28em" }}
        >
          {playing ? "● LIVE" : "○ STANDBY"}
        </span>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 px-6 lg:px-12 py-8 lg:py-10 items-center">
        {/* LEFT — vinyl */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div
            className="relative"
            style={{
              width: "min(82vw, 420px)",
              aspectRatio: "1 / 1",
              filter:
                "drop-shadow(0 30px 60px rgba(37,99,235,0.45)) drop-shadow(0 12px 28px rgba(0,0,0,0.55))",
            }}
          >
            <motion.div
              animate={controls}
              initial={{ rotate: 0 }}
              style={{ width: "100%", height: "100%", color: "#0a0a14" }}
            >
              <VinylRecord size="100%" weight="duotone" style={{ width: "100%", height: "100%" }} />
            </motion.div>
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "38%" }}
            >
              <motion.div
                animate={controls}
                initial={{ rotate: 0 }}
                className="aspect-square rounded-full flex flex-col items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #3b82f6, #1d4ed8 60%, #0b1740)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.18), 0 4px 22px rgba(0,0,0,0.55)",
                }}
              >
                <div
                  className="font-bold tracking-tight text-center leading-tight"
                  style={{ fontSize: "clamp(11px, 1.2vw, 16px)", color: "#fff", padding: "0 12%" }}
                >
                  CASHFLOW
                  <br />
                  GLITCH
                </div>
                <div
                  className="font-mono mt-1"
                  style={{ fontSize: "9px", color: "rgba(255,255,255,0.78)", letterSpacing: "0.18em" }}
                >
                  ASYSTEM · 2026
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* RIGHT — data panels */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4 lg:gap-5">
          <VUMeter label="L · CHAN" active={playing} delay={0} />
          <VUMeter label="R · CHAN" active={playing} delay={0.4} />

          <div
            className="col-span-2 relative overflow-hidden rounded-lg p-4 lg:p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="font-mono text-[10.5px] lg:text-[11.5px] font-semibold"
                style={{ color: "rgba(147,197,253,0.95)", letterSpacing: "0.25em" }}
              >
                SPECTRUM · 32 BAND
              </span>
              <span
                className="font-mono text-[10.5px] lg:text-[11.5px]"
                style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em" }}
              >
                −12 dB
              </span>
            </div>
            <div className="flex items-end gap-[2px] lg:gap-[3px] h-[60px] lg:h-[80px]">
              {WAVE_HEIGHTS.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    background: `linear-gradient(180deg, #93c5fd 0%, #2563EB ${30 + h * 50}%, #1e40af 100%)`,
                    height: `${h * 100}%`,
                    minHeight: 3,
                  }}
                  animate={
                    playing
                      ? { scaleY: [1, 0.4 + h * 0.7, 1, h * 0.5 + 0.5, 1] }
                      : { scaleY: 1 }
                  }
                  transition={
                    playing
                      ? {
                          duration: 0.7 + (i % 5) * 0.15,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : { duration: 0.4 }
                  }
                />
              ))}
            </div>
          </div>

          <div
            className="col-span-2 grid grid-cols-3 rounded-lg overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <DataCell label="BPM" value="128" accent />
            <DataCell label="KEY" value="A min" />
            <DataCell label="GENRE" value="GLITCH-HOP" />
          </div>
        </div>
      </div>

      {/* Bottom transport */}
      <div
        className="px-6 lg:px-12 py-5 lg:py-6 flex items-center gap-5 lg:gap-7"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.32))",
        }}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Пауза" : "Играть"}
          className="inline-flex items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 shrink-0"
          style={{
            width: 60,
            height: 60,
            background: "#2563EB",
            color: "#fff",
            boxShadow: playing
              ? "0 0 0 6px rgba(37,99,235,0.22), 0 12px 32px -8px rgba(37,99,235,0.7)"
              : "0 12px 32px -8px rgba(37,99,235,0.45)",
          }}
        >
          {playing ? <Pause size={22} fill="#fff" /> : <Play size={22} fill="#fff" style={{ marginLeft: 3 }} />}
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <span
              className="font-semibold tracking-tight truncate"
              style={{
                fontSize: "clamp(15px, 1.4vw, 19px)",
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Cashflow <span style={{ color: "#93c5fd" }}>Glitch</span>
            </span>
            <span
              className="font-mono text-[11px] lg:text-[12px] shrink-0"
              style={{ color: "rgba(255,255,255,0.78)", letterSpacing: "0.12em" }}
            >
              {fmt(time)} <span style={{ color: "rgba(255,255,255,0.4)" }}>/</span> {fmt(duration)}
            </span>
          </div>
          <div
            className="relative h-[4px] w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <div
              className="absolute inset-y-0 left-0 transition-[width] duration-300 rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #93c5fd, #2563EB)",
                boxShadow: "0 0 12px rgba(37,99,235,0.6)",
              }}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="/audio/cashflow-glitch.mp3" preload="metadata" />
    </section>
  );
}

function VUMeter({ label, active, delay }: { label: string; active: boolean; delay: number }) {
  const baseAngle = -55;
  const peakAngle = 60;
  return (
    <div
      className="relative overflow-hidden rounded-lg p-4 lg:p-5 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[10.5px] lg:text-[11.5px] font-semibold"
          style={{ color: "rgba(147,197,253,0.95)", letterSpacing: "0.25em" }}
        >
          {label}
        </span>
        <span
          className="font-mono text-[10px] lg:text-[11px]"
          style={{ color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em" }}
        >
          dB
        </span>
      </div>
      <div className="relative w-full" style={{ aspectRatio: "2 / 1" }}>
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Arc background */}
          <path
            d="M 18 90 A 82 82 0 0 1 182 90"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2"
          />
          {/* Tick marks — simple decorative */}
          {Array.from({ length: 11 }, (_, i) => {
            const a = -90 + (i / 10) * 180;
            const r1 = 78;
            const r2 = i % 5 === 0 ? 70 : 74;
            const rad = (a * Math.PI) / 180;
            const x1 = 100 + r1 * Math.cos(rad);
            const y1 = 90 + r1 * Math.sin(rad);
            const x2 = 100 + r2 * Math.cos(rad);
            const y2 = 90 + r2 * Math.sin(rad);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i >= 8 ? "#ef4444" : i >= 6 ? "#f59e0b" : "#93c5fd"}
                strokeWidth={i % 5 === 0 ? 2 : 1.2}
                opacity={i % 5 === 0 ? 1 : 0.55}
              />
            );
          })}
          {/* Needle */}
          <motion.line
            x1="100"
            y1="90"
            x2="100"
            y2="22"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transformOrigin: "100px 90px", filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}
            animate={
              active
                ? {
                    rotate: [
                      baseAngle + 10,
                      peakAngle - 5,
                      baseAngle + 25,
                      peakAngle - 18,
                      baseAngle + 18,
                    ],
                  }
                : { rotate: baseAngle }
            }
            transition={
              active
                ? { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay }
                : { duration: 0.6 }
            }
          />
          {/* Pivot dot */}
          <circle cx="100" cy="90" r="4" fill="#2563EB" />
          <circle cx="100" cy="90" r="1.5" fill="#fff" />
        </svg>
      </div>
    </div>
  );
}

function DataCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="px-4 py-3 lg:px-5 lg:py-4 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderRight: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span
        className="font-mono text-[10px] lg:text-[10.5px]"
        style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.25em" }}
      >
        {label}
      </span>
      <span
        className="font-bold tracking-tight"
        style={{
          fontSize: "clamp(16px, 1.6vw, 20px)",
          color: accent ? "#93c5fd" : "#fff",
          letterSpacing: "-0.01em",
          textShadow: accent ? "0 0 12px rgba(147,197,253,0.45)" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}
