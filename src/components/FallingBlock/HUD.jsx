import React from "react";

export default function HUD({
  onBack,
  correctCount,
  score,
  lives,
  timer,
  gameState,
  setGameState,
}) {
  return (
    <div className="absolute top-6 z-50 flex items-center bg-zinc-900/90 border border-white/20 p-1 rounded-2xl backdrop-blur-xl shadow-2xl">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-l-xl transition-colors font-black text-xs"
      >
        BACK
      </button>
      <div className="flex items-center gap-6 px-8 h-12">
        <Stat label="Solved" value={correctCount} color="text-emerald-400" />
        <Stat label="Score" value={score} color="text-cyan-400" border />
        <Stat label="Lives" value={lives} color="text-rose-500" />
        <Stat label="Timer" value={timer} color="text-amber-500" borderL />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setGameState(gameState === "PLAY" ? "PAUSE" : "PLAY");
        }}
        className={`px-6 py-3 font-black text-xs rounded-r-xl transition-all ${
          gameState === "PLAY"
            ? "bg-amber-500 hover:bg-amber-400"
            : "bg-emerald-500 hover:bg-emerald-400"
        } text-zinc-950`}
      >
        {gameState === "PLAY" ? "PAUSE" : "RESUME"}
      </button>
    </div>
  );
}

function Stat({ label, value, color, border, borderL }) {
  return (
    <div
      className={`w-16 text-center ${border ? "border-x border-white/10" : ""} ${borderL ? "border-l border-white/10" : ""}`}
    >
      <p className={`text-[9px] ${color} font-bold uppercase opacity-60`}>
        {label}
      </p>
      <p className="text-base font-black leading-none">{value}</p>
    </div>
  );
}
