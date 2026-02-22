import React from "react";
import { motion } from "framer-motion";

export default function Bird({ bird, isPaused }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ left: `${bird.x}%`, top: `${bird.y}%` }}
      className="absolute flex items-center z-10"
    >
      <div
        className={`relative z-20 px-4 py-1.5 rounded-xl font-bold shadow-lg border-2 text-lg transition-all duration-500 ${
          bird.status === "dying"
            ? "bg-yellow-400 text-white border-yellow-200 scale-0 opacity-0 rotate-12"
            : "bg-white text-slate-800 border-slate-100 shadow-md"
        }`}
      >
        {bird.text}
      </div>
      <div
        className={`z-10 -mr-2 -ml-1 transition-opacity duration-300 ${
          bird.status === "dying" ? "opacity-0" : "opacity-100"
        }`}
      >
        <svg width="45" height="12" viewBox="0 0 45 12" fill="none">
          <path
            d="M0 6C3.75 6 3.75 2 7.5 2C11.25 2 11.25 10 15 10C18.75 10 18.75 2 22.5 2C26.25 2 26.25 10 30 10C33.75 10 33.75 2 37.5 2C41.25 2 41.25 6 45 6"
            stroke="#64748b"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-60"
          />
        </svg>
      </div>
      <div
        className={`text-4xl inline-block transition-all duration-500 ${
          bird.status === "dying"
            ? "scale-[2.5] opacity-0 rotate-360deg blur-sm"
            : isPaused
              ? ""
              : "animate-bounce"
        } ${bird.color}`}
        style={{
          marginLeft: "-4px",
          lineHeight: "0.8",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {bird.status === "dying" ? "✨" : bird.emoji}
      </div>
    </motion.div>
  );
}
