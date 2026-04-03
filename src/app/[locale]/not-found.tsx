"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Glitch-style 404 */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
      >
        <div className="text-[120px] lg:text-[200px] font-extrabold font-display leading-none text-transparent bg-clip-text bg-gradient-to-b from-border-faint to-border-muted select-none">
          404
        </div>
        {/* Glitch layers */}
        <motion.div
          className="absolute inset-0 text-[120px] lg:text-[200px] font-extrabold font-display leading-none text-brand-500/10 select-none"
          animate={{ x: [-2, 2, -1, 0], y: [1, -1, 0] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
        >
          404
        </motion.div>
      </motion.div>

      <motion.h1
        className="text-2xl font-bold mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Page not found
      </motion.h1>

      <motion.p
        className="text-sm text-text-muted mb-8 text-center max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        The page you are looking for does not exist or has been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link href="/" className="relative inline-flex items-center justify-center h-12 px-8 rounded-xl text-white font-semibold text-sm overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 group-hover:from-brand-500 group-hover:to-accent-500 transition-all duration-500" />
          <span className="relative z-10 flex items-center gap-2">
            ← Back to Home
          </span>
        </Link>
      </motion.div>

      {/* Decorative scanning line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent"
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
