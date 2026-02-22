import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AIRunner({ aiX, playerX, gameState }) {
  return (
    <motion.div
      className="absolute z-10 left-1/2"
      style={{ bottom: "30%" }}
      animate={{
        x: Math.max(-450, Math.min(150, aiX - playerX - 350)),
        y: gameState === "PLAY" ? [0, 2, 0] : 0,
      }}
      transition={{
        x: { type: "spring", stiffness: 40, damping: 15 },
        y: { repeat: Infinity, duration: 0.5 },
      }}
    >
      <div className="flex flex-col items-center relative">
        <div className="bg-orange-500 text-white text-[12px] font-black px-2 py-0.5 rounded-full -mb-2.5 z-10 shadow-lg uppercase">
          AI
        </div>
        <motion.div
          animate={gameState === "PLAY" ? { y: [0, -20, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.45 }}
          className="text-[10rem] scale-x-[-1] relative flex justify-center"
          style={{ filter: "hue-rotate(260deg) saturate(1.5)" }}
        >
          🏃‍♂️
        </motion.div>
        {gameState === "PLAY" && <DustEffect color="bg-orange-200/40" />}
      </div>
    </motion.div>
  );
}

export function PlayerRunner({ gameState, isFinishing, word, typed, isError }) {
  return (
    <motion.div
      className="absolute left-1/2 -translate-x-1/2 z-20"
      style={{ bottom: "30%" }}
      animate={
        gameState === "PLAY" ? { x: ["-50%", "-48%", "-52%", "-50%"] } : {}
      }
      transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center relative">
        <AnimatePresence mode="wait">
          {gameState === "PLAY" && !isFinishing && (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="bg-white/95 px-4 py-2 rounded-2xl border-2 border-blue-500 shadow-xl relative min-w-27.5">
                <div className="text-lg font-black text-zinc-800 text-center">
                  {word}
                </div>
                <div className="mt-1 h-7 bg-zinc-50 rounded-lg flex items-center justify-center px-3 border border-zinc-100">
                  <span
                    className={`text-lg font-bold ${isError ? "text-red-500" : "text-blue-600"}`}
                  >
                    {typed}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={gameState === "PLAY" ? { y: [0, -25, 0] } : {}}
          transition={{ repeat: Infinity, duration: 0.4 }}
          className="text-[10rem] scale-x-[-1] drop-shadow-2xl relative flex justify-center"
        >
          🏃‍♂️
          <div className="scale-x-[-1] absolute top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[14px] font-black px-2 py-0.5 rounded-full shadow-md">
            Player
          </div>
        </motion.div>
        {gameState === "PLAY" && <DustEffect color="bg-blue-200/30" />}
      </div>
    </motion.div>
  );
}

function DustEffect({ color }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0.8, 2, 0.5],
            opacity: [0, 1, 0],
            x: [0, -130],
            y: [0, -20],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            delay: i * 0.1,
            ease: "easeOut",
          }}
          className={`absolute bottom-0 left-1/2 w-6 h-6 ${color} rounded-full blur-[6px]`}
        />
      ))}
    </div>
  );
}
