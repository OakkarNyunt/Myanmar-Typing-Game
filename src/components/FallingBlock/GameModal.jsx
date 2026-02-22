import React from "react";
import profile from "@/assets/images/Profile.jpg";

export default function GameModal({
  gameState,
  score,
  correctCount,
  timer,
  language,
  setLanguage,
  diffLevel,
  setDiffLevel,
  onStart,
  onBack,
}) {
  if (gameState === "PLAY") return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center backdrop-blur-xl">
      <div className="text-center p-10 bg-zinc-900/80 border border-white/10 rounded-[3.5rem] shadow-2xl w-112.5">
        <div className="flex flex-col items-center mb-6">
          <img
            src={profile}
            className="w-24 h-24 rounded-full border-2 border-blue-500 mb-2 object-cover"
            alt="profile"
          />
          <h2 className="text-white font-black text-xl">Oakkar Nyunt</h2>
          <p className="text-blue-400 text-xs">oakkarnyunt@gmail.com</p>
        </div>

        <h1
          className={`text-5xl font-black mb-8 italic uppercase ${gameState === "GAMEOVER" ? "text-rose-500" : "text-blue-500"}`}
        >
          {gameState === "PAUSE"
            ? "Paused"
            : gameState === "GAMEOVER"
              ? "Game Over"
              : "Falling Block"}
        </h1>

        {gameState === "GAMEOVER" && (
          <div className="grid grid-cols-3 gap-4 mb-10 bg-black/30 p-6 rounded-3xl border border-white/5">
            <StatResult
              label="Final Score"
              value={score}
              color="text-cyan-400"
            />
            <StatResult
              label="Total Solved"
              value={correctCount}
              color="text-emerald-400"
              border
            />
            <StatResult
              label="Total Time"
              value={timer}
              color="text-amber-500"
            />
          </div>
        )}

        {gameState === "START" && (
          <div className="flex flex-col gap-6 mb-10 text-white">
            <div className="flex bg-zinc-800/50 p-1.5 rounded-2xl">
              {["english", "myanmar"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${language === l ? "bg-blue-600 text-white" : "text-zinc-500"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDiffLevel(lvl)}
                  className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] ${diffLevel === lvl ? "border-blue-500 text-blue-400" : "border-zinc-700 text-zinc-600"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button
            onClick={onStart}
            className="w-full py-5 bg-blue-600 rounded-3xl text-2xl font-black hover:bg-blue-500 transition-all uppercase"
          >
            {gameState === "PAUSE" ? "Continue" : "Start Game"}
          </button>
          <button
            onClick={onBack}
            className="text-zinc-500 font-bold uppercase text-xs mt-2 hover:text-rose-400"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function StatResult({ label, value, color, border }) {
  return (
    <div
      className={`flex flex-col ${border ? "border-x border-white/10" : ""}`}
    >
      <span className={`text-[10px] ${color} font-bold uppercase opacity-70`}>
        {label}
      </span>
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
  );
}
