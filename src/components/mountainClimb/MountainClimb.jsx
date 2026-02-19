import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profile from "@/assets/images/Profile.jpg";

const LEVELS = {
  EASY: { aiSpeed: 1.2, dist: 3500, label: "EASY", dbKey: "EASY" },
  MEDIUM: { aiSpeed: 2.0, dist: 5000, label: "MEDIUM", dbKey: "MEDIUM" },
  HARD: { aiSpeed: 2.8, dist: 6500, label: "HARD", dbKey: "HARD" },
  VERY_HARD: {
    aiSpeed: 3.6,
    dist: 8000,
    label: "VERY HARD",
    dbKey: "VERY_HARD",
  },
};

export default function SprintMarathon({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START");
  const [level, setLevel] = useState(LEVELS.EASY);
  const [playerX, setPlayerX] = useState(0);
  const [aiX, setAiX] = useState(0);
  const [word, setWord] = useState("");
  const [typed, setTyped] = useState("");
  const [isError, setIsError] = useState(false);

  // Sound Refs
  const sounds = useRef({
    bg: new Audio("./sounds/bg_music.mp3"),
    win: new Audio("./sounds/gamee-win.wav"),
    lose: new Audio("./sounds/lose.wav"),
  });

  useEffect(() => {
    const bg = sounds.current.bg;
    bg.loop = true;
    bg.volume = 0.3;
    if (gameState === "PLAY") bg.play().catch(() => {});
    else bg.pause();
  }, [gameState]);

  const handleExit = () => {
    sounds.current.bg.pause();
    sounds.current.bg.currentTime = 0;
    onBack();
  };

  const getNextWord = useCallback(
    (dbKey) => {
      if (!wordData || !wordData[dbKey]) return "Loading...";
      const list = wordData[dbKey];
      return list[Math.floor(Math.random() * list.length)];
    },
    [wordData],
  );

  // Keyboard Interaction
  useEffect(() => {
    const handleKey = (e) => {
      if (gameState === "PAUSE") {
        // Pause လုပ်ထားရင် Escape နှိပ်ရင် Resume ပြန်လုပ်မယ်
        if (e.key === "Escape") setGameState("PLAY");
        return;
      }
      if (gameState !== "PLAY") return;

      if (e.key === "Escape") {
        // PLAY mode မှာ Escape နှိပ်ရင် Pause လုပ်မယ်
        setGameState("PAUSE");
        return;
      }

      if (e.key === "Backspace") {
        setTyped((prev) => prev.slice(0, -1));
        setIsError(false);
        return;
      }
      if (e.key.length !== 1) return;

      if (e.key === word[typed.length]) {
        const nextTyped = typed + e.key;
        setTyped(nextTyped);
        setIsError(false);
        if (nextTyped === word) {
          setPlayerX((prev) => prev + 250);
          setWord(getNextWord(level.dbKey));
          setTyped("");
        }
      } else {
        setIsError(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, word, typed, level, getNextWord]);

  // Game Logic & Result Sounds
  useEffect(() => {
    let interval;
    if (gameState === "PLAY") {
      interval = setInterval(() => {
        setAiX((prev) => {
          const nextAi = prev + level.aiSpeed * 6;
          if (nextAi >= level.dist) {
            setGameState("LOSE");
            sounds.current.bg.pause();
            sounds.current.lose.currentTime = 0;
            sounds.current.lose.play().catch(() => {});
            return level.dist;
          }
          return nextAi;
        });
      }, 100);
    }
    if (playerX >= level.dist && gameState === "PLAY") {
      setGameState("WIN");
      const bg = sounds.current.bg;
      bg.pause();
      bg.currentTime = 0;
      const winSfx = sounds.current.win;
      winSfx.currentTime = 0;
      winSfx.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [gameState, playerX, level]);

  useEffect(() => {
    setGameState("LOADING");
    fetch("./data/wordsForRunning.json")
      .then((res) => res.json())
      .then((data) => {
        setWordData(data);
        setGameState("START");
      })
      .catch(() => setGameState("START"));
  }, []);

  const initRace = (lv) => {
    const sel = lv || level;
    setLevel(sel);
    setPlayerX(0);
    setAiX(0);
    setTyped("");
    setIsError(false);
    setWord(getNextWord(sel.dbKey));
    setGameState("PLAY");
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden text-white select-none">
      {/* HUD Bar */}
      <div className="p-6 bg-zinc-900 border-b-2 border-zinc-800 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="px-6 py-2 bg-zinc-800 hover:bg-red-700 rounded-xl font-bold transition-colors"
          >
            EXIT
          </button>

          {/* PAUSE BUTTON (Play state မှာသာ ပြသမည်) */}
          {gameState === "PLAY" && (
            <button
              onClick={() => setGameState("PAUSE")}
              className="px-5 py-2 rounded-xl font-black bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2"
            >
              <span className="text-xl">⏸️</span> PAUSE
            </button>
          )}
        </div>

        <div className="flex-1 max-w-md px-10">
          <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 relative shadow-inner">
            <motion.div
              className="absolute h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"
              animate={{ width: `${(playerX / level.dist) * 100}%` }}
            />
            <motion.div
              className="absolute h-full bg-red-600/40"
              animate={{ width: `${(aiX / level.dist) * 100}%` }}
            />
          </div>
        </div>
        <div className="font-black italic text-zinc-500 uppercase tracking-widest">
          {level.label}
        </div>
      </div>

      <div className="flex-1 relative bg-zinc-900 flex flex-col justify-center">
        {/* Track Design */}
        <div className="absolute inset-x-0 h-96 bg-zinc-800/30 border-y-4 border-zinc-700/50" />

        {/* AI ROBOT */}
        <motion.div
          className="absolute z-20"
          animate={{ x: aiX - playerX + 200 }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <div className="text-9xl drop-shadow-2xl">🤖</div>
        </motion.div>

        {/* PLAYER CHARACTER & WORD BUBBLE */}
        <div className="absolute left-[250px] z-30 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {gameState === "PLAY" && (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="mb-8 bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl border-b-4 border-zinc-300 min-w-max relative"
              >
                <div className="text-3xl font-black text-zinc-900 tracking-tight">
                  {word.split("").map((c, i) => (
                    <span
                      key={i}
                      className={
                        i < typed.length
                          ? "text-emerald-600"
                          : i === typed.length && isError
                            ? "text-red-600 animate-pulse"
                            : "text-zinc-300"
                      }
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* RUNNING ANIMATION PLAYER */}
          <motion.div
            animate={
              gameState === "PLAY"
                ? {
                    y: [0, -25, 0],
                    rotate: [-5, 5, -5],
                    scaleY: [1, 0.9, 1],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 0.35, ease: "easeInOut" }}
            className="text-8xl filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
          >
            🏃‍♂️
          </motion.div>
        </div>
      </div>

      {/* PAUSE MODAL OVERLAY */}
      <AnimatePresence>
        {gameState === "PAUSE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4"
          >
            {/* Main Glass Modal */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative bg-zinc-900/80 border border-white/10 backdrop-blur-md p-10 rounded-[3rem] text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full overflow-hidden"
            >
              {/* Background Decorative Glows */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 blur-[80px]" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[80px]" />

              {/* Logo Section */}
              <div className="relative mb-10">
                <h2 className="text-5xl font-black italic bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent uppercase tracking-tighter">
                  CYBER SPRINT
                </h2>
                <div className="h-1 w-20 bg-blue-500 mx-auto mt-2 rounded-full shadow-[0_0_10px_#3b82f6]" />
              </div>

              {/* Developer Profile Card */}
              <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 mb-10 relative group">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {/* Profile Image Border Animation */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 8,
                      ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/50"
                  />
                  <img
                    src={profile}
                    alt="Developer"
                    className="w-full h-full rounded-full object-cover p-2"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=Dev&background=0D8ABC&color=fff";
                    }}
                  />
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Your Name
                </h3>
                <p className="text-blue-400 font-medium text-sm">
                  developer@email.com
                </p>

                <div className="mt-4 flex justify-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/10 rounded-full text-[10px] text-blue-300 border border-blue-500/20 uppercase font-bold tracking-widest">
                    Lead Developer
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] text-emerald-300 border border-emerald-500/20 uppercase font-bold tracking-widest">
                    UI Designer
                  </span>
                </div>
              </div>

              {/* Big Animated Play Button */}
              <div className="relative flex justify-center">
                <motion.button
                  onClick={() => setGameState("PLAY")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.6)]"
                >
                  {/* Pulse Rings */}
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-blue-500 rounded-full"
                  />
                  <span className="relative text-3xl">▶️</span>
                </motion.button>
              </div>

              <p className="mt-8 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                Click to Resume Race
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAYS (START/WIN/LOSE) - Your existing code for these overlays */}
      <AnimatePresence>
        {(gameState === "START" ||
          gameState === "WIN" ||
          gameState === "LOSE") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="bg-zinc-900 p-12 rounded-[3rem] text-center border border-zinc-800 shadow-2xl">
              <h1 className="text-7xl font-black mb-10 italic text-blue-500 uppercase tracking-tighter">
                {gameState === "START"
                  ? "Cyber Sprint"
                  : gameState === "WIN"
                    ? "Victory!"
                    : "Defeat!"}
              </h1>
              {gameState === "START" ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(LEVELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => initRace(v)}
                      className="p-5 bg-zinc-800 rounded-2xl font-black text-xl hover:bg-blue-600 transition-all uppercase"
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => initRace()}
                    className="py-6 px-16 bg-blue-600 rounded-2xl font-black text-3xl shadow-lg hover:bg-blue-500"
                  >
                    TRY AGAIN
                  </button>
                  <button
                    onClick={() => setGameState("START")}
                    className="py-4 text-zinc-500 font-bold uppercase hover:text-white transition-colors"
                  >
                    Main Menu
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
