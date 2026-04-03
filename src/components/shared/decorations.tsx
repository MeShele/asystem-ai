"use client";

/* ─── Floating code snippet ─── */
export function DecoCode({
  children,
  className = "",
}: {
  children: string;
  className: string;
}) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="deco-code whitespace-pre">{children}</div>
    </div>
  );
}

/* ─── Mono tag label ─── */
export function DecoTag({
  children,
  className = "",
}: {
  children: string;
  className: string;
}) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="deco-tag">{children}</div>
    </div>
  );
}

/* ─── Dot cluster ─── */
export function DecoDots({ className = "" }: { className: string }) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="dot-pattern w-24 h-24" />
    </div>
  );
}

/* ─── Circle ring ─── */
export function DecoRing({
  className = "",
  size = 80,
}: {
  className: string;
  size?: number;
}) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="deco-ring float" style={{ width: size, height: size }} />
    </div>
  );
}

/* ─── Cross mark (+) ─── */
export function DecoCross({ className = "" }: { className: string }) {
  return (
    <div className={`absolute hidden lg:block ${className}`}>
      <div className="deco-cross" />
    </div>
  );
}

/* ─── Dot grid background for sections ─── */
export function DotGridBg() {
  return (
    <div className="absolute inset-0 dot-grid-bg pointer-events-none" />
  );
}

/* ─── Noise grain (global, add once in layout) ─── */
export function NoiseGrain() {
  return (
    <svg className="noise-overlay" aria-hidden="true">
      <filter id="noise-filter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise-filter)" />
    </svg>
  );
}
