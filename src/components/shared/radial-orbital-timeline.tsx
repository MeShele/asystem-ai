"use client";

export type OrbitalNode = {
  id: number;
  title: string;
  date: string;
  content: string;
  icon: React.ElementType;
  energy: number;
};

interface RadialOrbitalTimelineProps {
  nodes: OrbitalNode[];
  centerLabel?: string;
}

const RADIUS = 200;
const ROTATION_SECONDS = 60;

/**
 * Радиальная орбита: контейнер вращается через CSS @keyframes (GPU-композитный),
 * каждая нода оборачивается обратной анимацией чтобы текст оставался читаемым.
 * Никакого JS-RAF — нагрузка ~0 на main thread.
 */
export function RadialOrbitalTimeline({ nodes, centerLabel = "∞" }: RadialOrbitalTimelineProps) {
  return (
    <div
      className="relative w-full flex items-center justify-center overflow-visible select-none"
      style={{ minHeight: "clamp(420px, 46vh, 500px)" }}
    >
      <div
        className="relative w-full flex items-center justify-center"
        style={{ height: "clamp(420px, 46vh, 500px)" }}
      >
        {/* Central node */}
        <div
          className="absolute w-24 h-24 rounded-full flex items-center justify-center z-10 pointer-events-none"
          style={{
            background: "linear-gradient(160deg, #2563EB 0%, #1D4ED8 100%)",
            boxShadow: "0 18px 44px rgba(37,99,235,0.35)",
          }}
        >
          <div
            className="absolute w-28 h-28 rounded-full border pointer-events-none"
            style={{ borderColor: "rgba(37,99,235,0.45)" }}
          />
          <span
            className="font-semibold text-white tracking-tight leading-none"
            style={{ fontSize: 36, letterSpacing: "-0.04em" }}
          >
            {centerLabel}
          </span>
        </div>

        {/* Inner ring */}
        <div
          className="absolute rounded-full border border-dashed pointer-events-none"
          style={{
            width: 240,
            height: 240,
            borderColor: "rgba(147,197,253,0.3)",
          }}
        />

        {/* Orbit rings */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full border pointer-events-none"
          style={{ borderColor: "rgba(255,255,255,0.18)" }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full border border-dashed pointer-events-none"
          style={{ borderColor: "rgba(147,197,253,0.4)" }}
        />

        {/* Compass ticks */}
        {[0, 90, 180, 270].map((deg) => (
          <div
            key={deg}
            className="absolute pointer-events-none"
            style={{
              width: 1,
              height: 18,
              background: "rgba(37,99,235,0.5)",
              transform: `rotate(${deg}deg) translateY(-215px)`,
              transformOrigin: "center",
            }}
          />
        ))}

        {/* Rotating orbit container — CSS @keyframes (GPU only, no JS RAF) */}
        <div
          className="absolute"
          style={{
            width: 0,
            height: 0,
            animation: `orbitSpin ${ROTATION_SECONDS}s linear infinite`,
            willChange: "transform",
          }}
        >
          {nodes.map((item, index) => {
            const angle = (index / nodes.length) * 360;
            const radian = (angle * Math.PI) / 180;
            const x = RADIUS * Math.cos(radian);
            const y = RADIUS * Math.sin(radian);
            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  left: 0,
                  top: 0,
                  transform: `translate3d(${x}px, ${y}px, 0)`,
                }}
              >
                {/* counter-rotate so text stays upright */}
                <div
                  style={{
                    animation: `orbitCounter ${ROTATION_SECONDS}s linear infinite`,
                    willChange: "transform",
                  }}
                >
                  <OrbitNode node={item} />
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes orbitSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes orbitCounter {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

function OrbitNode({ node }: { node: OrbitalNode }) {
  const Icon = node.icon;
  return (
    <div className="relative pointer-events-none">
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono font-semibold"
        style={{
          color: "#93c5fd",
          letterSpacing: "0.28em",
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
        }}
      >
        {node.date.toUpperCase()}
      </div>

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center border-2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "#fff",
          color: "#2563EB",
          borderColor: "rgba(147,197,253,0.7)",
          boxShadow: "0 4px 14px rgba(37,99,235,0.45)",
        }}
      >
        <Icon size={20} />
      </div>

      <div
        className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-semibold"
        style={{
          color: "#fff",
          fontFamily: "var(--font-mono, monospace)",
          letterSpacing: "0.18em",
          textShadow: "0 1px 6px rgba(0,0,0,0.55)",
        }}
      >
        {node.title.toUpperCase()}
      </div>
    </div>
  );
}
