"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * Microsoft Fluent Emoji 3D — реальные 3D-рендеры от MS Designer team.
 * MIT-лицензия, без вотермарка, без WebGL.
 * https://github.com/microsoft/fluentui-emoji
 */
export const SPLINE_SCENES = {
  globe: "/services/globe.png",
  robot: "/services/robot.png",
  gear: "/services/gear.png",
  phone: "/services/phone.png",
} as const;

export type SplineKind = keyof typeof SPLINE_SCENES;

const ALT_TEXT: Record<SplineKind, string> = {
  globe: "Глобус",
  robot: "Робот",
  gear: "Шестерёнка",
  phone: "Мобильный телефон",
};

export function LiquidSpline({ kind }: { kind: SplineKind }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0] }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          // Размер от высоты контейнера — чтобы объект всегда вписывался по короткой стороне
          height: "82%",
          aspectRatio: "1 / 1",
          maxWidth: "70%",
          // Тинт white-clay → brand-blue + объёмная тень
          filter:
            "sepia(1) hue-rotate(195deg) saturate(3.5) brightness(0.9) drop-shadow(0 24px 48px rgba(37, 99, 235, 0.28)) drop-shadow(0 12px 24px rgba(0,0,0,0.10))",
        }}
      >
        <Image
          src={SPLINE_SCENES[kind]}
          alt={ALT_TEXT[kind]}
          fill
          sizes="(max-width: 768px) 40vw, 200px"
          style={{ objectFit: "contain" }}
          priority={false}
        />
      </motion.div>
    </div>
  );
}
