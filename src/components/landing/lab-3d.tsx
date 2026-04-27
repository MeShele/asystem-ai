"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export type LabShape = string;

export function LabCanvas({ shape }: { shape: LabShape; color?: string }) {
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
          height: "60%",
          aspectRatio: "1 / 1",
          maxWidth: "60%",
          filter:
            "sepia(1) hue-rotate(195deg) saturate(3.5) brightness(0.9) drop-shadow(0 18px 36px rgba(37, 99, 235, 0.28)) drop-shadow(0 8px 16px rgba(0,0,0,0.10))",
        }}
      >
        <Image
          src={shape}
          alt=""
          fill
          sizes="(max-width: 768px) 30vw, 160px"
          style={{ objectFit: "contain" }}
          priority={false}
        />
      </motion.div>
    </div>
  );
}
