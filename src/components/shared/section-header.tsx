"use client";

import { motion } from "framer-motion";

interface SectionHeaderProps {
  number?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeader({
  number,
  title,
  titleAccent,
  subtitle,
  center = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      className={`mb-16 ${center ? "text-center" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {number && (
        <span className="font-mono text-xs font-semibold tracking-widest uppercase text-brand-500 mb-3 block">
          {number}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
        {title}
        {titleAccent && (
          <>
            <br />
            <span className="accent-text">{titleAccent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-lg mt-4 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
