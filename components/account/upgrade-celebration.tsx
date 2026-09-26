"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export function UpgradeCelebration({
  show,
  width,
  height,
}: {
  show: boolean;
  width: number;
  height: number;
}) {
  if (!show) return null;

  return (
    <>
      <Confetti
        width={width}
        height={height}
        colors={["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"]}
        numberOfPieces={200}
        gravity={0.15}
        tweenDuration={5000}
      />
      <motion.div
        initial={{ x: -50, y: height / 2, opacity: 0, scale: 0.5 }}
        animate={{ x: width + 50, y: height / 2, opacity: 1, scale: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="fixed z-50 pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative">
          <motion.div
            className="w-16 h-24 bg-gradient-to-b from-orange-400 to-red-500 rounded-t-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-12"
            animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="w-full h-full bg-gradient-to-t from-orange-500 to-transparent rounded-full" />
          </motion.div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-300 rounded-full border-2 border-white" />
        </div>
      </motion.div>
    </>
  );
}
