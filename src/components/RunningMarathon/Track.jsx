import React from "react";
import { motion } from "framer-motion";

export default function Track({ gameState, playerX, levelDist }) {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ willChange: "transform" }}
      >
        <motion.div
          animate={
            gameState === "PLAY"
              ? {
                  backgroundPositionX: ["0px", "-320px"],
                  backgroundPositionY: ["-10px", "10px"],
                }
              : {}
          }
          transition={{
            backgroundPositionX: {
              repeat: Infinity,
              duration: 1,
              ease: "linear",
            },
            backgroundPositionY: {
              repeat: Infinity,
              duration: 0.5,
              ease: "easeInOut",
              repeatType: "mirror",
            },
          }}
          className="absolute w-full"
          style={{
            height: "4px",
            top: "70%",
            marginTop: "-3rem",
            backgroundImage: `linear-gradient(90deg, #3b82f6 0%, #3b82f6 60%, transparent 60%)`,
            backgroundSize: "160px 100%",
            opacity: 0.8,
            boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
          }}
        />
      </div>
      <div
        className="absolute z-30"
        style={{
          bottom: "30%",
          left: "50%",
          transform: `translateX(${(levelDist - playerX) * 2}px)`,
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-2 h-72 bg-zinc-400 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-4 left-2 text-8xl drop-shadow-2xl">
            🏁
          </div>
        </div>
      </div>
    </>
  );
}
