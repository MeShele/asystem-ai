"use client";

// Firecrawl-style decorative grid lines and corner ornaments
export function GridLines() {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-screen pointer-events-none z-[2]">
      <div className="absolute inset-0 border-x border-border-faint" />
    </div>
  );
}

export function CornerOrnament({
  position,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const posClasses = {
    "top-left": "-left-[10.5px] -top-[10.5px]",
    "top-right": "-right-[10.5px] -top-[10.5px]",
    "bottom-left": "-left-[10.5px] -bottom-[10.5px]",
    "bottom-right": "-right-[10.5px] -bottom-[10.5px]",
  };

  return (
    <div
      className={`fc-corner absolute ${posClasses[position]}`}
    >
      <svg viewBox="0 0 22 22" fill="none">
        <path
          d="M10.5 4C10.5 7.31371 7.81371 10 4.5 10H0.5V11H4.5C7.81371 11 10.5 13.6863 10.5 17V21H11.5V17C11.5 13.6863 14.1863 11 17.5 11H21.5V10H17.5C14.1863 10 11.5 7.31371 11.5 4V0H10.5V4Z"
          fill="var(--color-border-faint)"
        />
      </svg>
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="fc-container">
      <div className="relative">
        <div className="fc-divider" />
        <CornerOrnament position="top-left" />
        <CornerOrnament position="top-right" />
      </div>
    </div>
  );
}

export function MonoTag({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`fc-tag ${className}`}>[ {children} ]</span>
  );
}
