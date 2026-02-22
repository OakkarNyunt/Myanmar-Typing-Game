import React from "react";
import { motion } from "framer-motion";

export default function HUD({
  onBack,
  gameState,
  setGameState,
  playerX,
  levelDist,
  selectedLang,
  levelLabel,
}) {
  return (
    <div className="h-20 bg-zinc-900 border-b border-white/10 flex items-center px-8 justify-between z-50">
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 font-bold"
        >
          EXIT
        </button>
        <button
          onClick={() => setGameState((s) => (s === "PLAY" ? "PAUSE" : "PLAY"))}
          className="px-6 py-2 bg-blue-600 rounded-lg font-black"
        >
          {gameState === "PAUSE" ? "▶️ RESUME" : "⏸️ PAUSE"}
        </button>
      </div>
      <div className="flex-1 mx-10 h-3 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          animate={{ width: `${(playerX / levelDist) * 100}%` }}
        />
      </div>
      <div className="text-blue-500 font-black italic">
        {selectedLang} - {levelLabel}
      </div>
    </div>
  );
}
