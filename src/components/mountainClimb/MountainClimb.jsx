import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
  "REVOLUTION",
  "TECHNOLOGY",
  "CHAMPIONSHIP",
  "PERFORMANCE",
  "INTELLIGENCE",
  "STAMINA",
  "MARATHON",
  "EXCELLENCE",
  "MOTIVATION",
  "STRATEGY",
  "DISCIPLINE",
  "CONSISTENCY",
  "VELOCITY",
  "AMBITION",
  "CONQUEROR",
];

const LEVELS = {
  EASY: { aiSpeed: 0.5, dist: 3500, label: "EASY (3 MINS)" },
  MEDIUM: { aiSpeed: 1, dist: 5000, label: "MEDIUM (3 MINS)" },
  HARD: { aiSpeed: 1.8, dist: 6500, label: "HARD (3 MINS)" },
  VERY_HARD: { aiSpeed: 2.5, dist: 8000, label: "VERY HARD (3 MINS)" },
};

export default function SprintMarathon({ onBack }) {
  const [gameState, setGameState] = useState("START");
  const [level, setLevel] = useState(LEVELS.EASY);
  const [playerX, setPlayerX] = useState(0);
  const [aiX, setAiX] = useState(0);
  const [word, setWord] = useState("");
  const [typed, setTyped] = useState("");
  const [isError, setIsError] = useState(false);

  const startRace = (lv) => {
    setLevel(lv);
    setPlayerX(0);
    setAiX(0);
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setTyped("");
    setIsError(false);
    setGameState("PLAY");
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== "PLAY") return;
      const char = e.key.toUpperCase();

      if (char.length === 1 && /[A-Z]/.test(char)) {
        const nextTyped = typed + char;
        if (word.startsWith(nextTyped)) {
          setTyped(nextTyped);
          setIsError(false);
          if (nextTyped === word) {
            setPlayerX((p) => p + 120); // စာလုံးတစ်လုံးမှန်ရင် ၁၂၀ မီတာတိုးမယ်
            setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
            setTyped("");
          }
        } else {
          setIsError(true);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, typed, word]);

  useEffect(() => {
    let timer;
    if (gameState === "PLAY") {
      timer = setInterval(() => {
        setAiX((p) => p + level.aiSpeed * 6);
      }, 100);
    }
    if (playerX >= level.dist) setGameState("WIN");
    if (aiX >= level.dist) setGameState("LOSE");
    return () => clearInterval(timer);
  }, [gameState, playerX, aiX, level]);

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden select-none font-sans text-white">
      {/* STATUS HUD */}
      <div className="p-6 bg-zinc-900 border-b-2 border-zinc-800 flex justify-between items-center z-50">
        <button
          onClick={onBack}
          className="px-5 py-2 bg-zinc-800 hover:bg-red-700 rounded-lg font-bold transition-all"
        >
          EXIT
        </button>
        <div className="text-center bg-zinc-800 px-6 py-1 rounded-full border border-zinc-700">
          <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
            Race Progress
          </p>
          <div className="w-48 h-2 bg-zinc-700 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              animate={{ width: `${(playerX / level.dist) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] text-blue-400 font-bold">YOU</p>
            <p className="text-xl font-black">{Math.floor(playerX)}m</p>
          </div>
          <div className="text-right border-l border-zinc-700 pl-6">
            <p className="text-[10px] text-red-500 font-bold">ROBOT AI</p>
            <p className="text-xl font-black">{Math.floor(aiX)}m</p>
          </div>
        </div>
      </div>

      {/* 3D-STYLE TRACK AREA */}
      <div className="flex-1 relative bg-zinc-900 overflow-hidden flex flex-col justify-center">
        {/* Victory/Defeat Special FX */}
        {gameState === "WIN" && (
          <div className="absolute inset-0 z-40 bg-blue-500/10 pointer-events-none">
            {Array(40)
              .fill(0)
              .map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400"
                  initial={{ y: -10, x: `${Math.random() * 100}%` }}
                  animate={{ y: 1000 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random(),
                  }}
                />
              ))}
          </div>
        )}

        {/* Lanes */}
        <div className="absolute inset-x-0 h-72 bg-zinc-800/50 border-y-4 border-zinc-700 z-10">
          <div className="h-1/2 border-b-2 border-dashed border-zinc-600 flex items-center justify-end px-10">
            <div className="text-4xl opacity-20 font-black italic">
              FINISH LINE 🏁
            </div>
          </div>
        </div>

        {/* Scrolling Environment */}
        <motion.div
          className="absolute inset-0 flex items-center opacity-10 pointer-events-none"
          animate={{ x: -(playerX % 2000) }}
          transition={{ type: "linear", ease: "linear" }}
        >
          <div className="text-[15rem] font-black italic whitespace-nowrap">
            CYBER SPRINT 2026 CYBER SPRINT 2026
          </div>
        </motion.div>

        {/* ROBOT AI (Shaking & Bouncing) */}
        <motion.div
          className="absolute z-20"
          animate={{ x: aiX - playerX + 200 }}
          transition={{ type: "spring", stiffness: 40 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0], x: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <span className="text-8xl drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              🤖
            </span>
            <div className="mt-2 bg-red-600 text-[10px] px-3 py-1 rounded-full font-black uppercase shadow-lg">
              System Bot
            </div>
          </motion.div>
        </motion.div>

        {/* PLAYER (Centered Focus) */}
        <div className="absolute left-[200px] z-30">
          <div className="flex flex-col items-center relative">
            {/* WORD BUBBLE */}
            <AnimatePresence mode="wait">
              {gameState === "PLAY" && (
                <motion.div
                  key={word}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-32 bg-white px-8 py-4 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.5)] min-w-[250px] text-center"
                >
                  <div className="text-4xl font-black tracking-[0.15em] text-zinc-900">
                    {word.split("").map((char, i) => {
                      let color = "text-zinc-900";
                      if (i < typed.length) color = "text-emerald-600";
                      else if (i === typed.length && isError)
                        color = "text-red-600";
                      return (
                        <span key={i} className={color}>
                          {char}
                        </span>
                      );
                    })}
                  </div>
                  <div className="h-1 bg-zinc-100 mt-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(typed.length / word.length) * 100}%`,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              animate={
                gameState === "PLAY"
                  ? { y: [0, -30, 0], rotate: [-5, 5, -5] }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="text-8xl filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              🏃‍♂️
            </motion.div>
            <div className="mt-4 bg-blue-600 px-6 py-1.5 rounded-full text-xs font-black shadow-xl border-2 border-blue-400 uppercase">
              You
            </div>
          </div>
        </div>
      </div>

      {/* MENU & LEVEL SELECTION OVERLAY */}
      <AnimatePresence>
        {gameState !== "PLAY" && (
          <motion.div className="absolute inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-6 text-center">
            <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full">
              <h1 className="text-5xl font-black mb-4 italic tracking-tighter text-blue-500">
                {gameState === "START"
                  ? "SPRINT MARATHON"
                  : gameState === "WIN"
                    ? "🏆 HUMAN WINS!"
                    : "🤖 ROBOT WINS!"}
              </h1>
              <p className="text-zinc-500 font-bold mb-10 uppercase tracking-[0.2em] text-sm">
                {gameState === "START"
                  ? "3-Minute Typing Challenge"
                  : `Final Distance: ${Math.floor(playerX)} Meters`}
              </p>

              {gameState === "START" ? (
                <div className="flex flex-col gap-3">
                  {Object.entries(LEVELS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => startRace(value)}
                      className="p-5 bg-zinc-800 hover:bg-blue-600 text-zinc-300 hover:text-white rounded-2xl font-black transition-all border border-zinc-700 hover:border-blue-400"
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setGameState("START")}
                  className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  RETURN TO HUB
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
