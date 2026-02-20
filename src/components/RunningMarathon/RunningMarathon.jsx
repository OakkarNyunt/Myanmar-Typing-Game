import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Profile from "@/assets/images/Profile.jpg";

const LEVELS = {
  EASY: { aiSpeed: 1.2, dist: 15000, label: "EASY" },
  MEDIUM: { aiSpeed: 2.2, dist: 25000, label: "MEDIUM" },
  HARD: { aiSpeed: 3.2, dist: 35000, label: "HARD" },
  Pro: { aiSpeed: 4.2, dist: 45000, label: "VERY HARD" },
};

export default function SprintMarathon({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START");
  const [selectedLang, setSelectedLang] = useState("ENGLISH");
  const [level, setLevel] = useState(LEVELS.EASY);
  const [playerX, setPlayerX] = useState(0);
  const [aiX, setAiX] = useState(0);
  const [word, setWord] = useState("");
  const [typed, setTyped] = useState("");
  const [isError, setIsError] = useState(false);
  const [combo, setCombo] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const screenControls = useAnimation();

  // Audio Optimization: Use ref to persist audio instances
  const sounds = useRef({
    wrong: null,
    win: null,
    lose: null,
    bg: null,
  });

  // 1. Initialize Audio on Mount (Prevents Invalid URI Error)
  useEffect(() => {
    sounds.current.wrong = new Audio("/sounds/mistake.mp3");
    sounds.current.win = new Audio("/sounds/gamewin.mp3");
    sounds.current.lose = new Audio("/sounds/lose.mp3");
    sounds.current.bg = new Audio("/sounds/bg_music.mp3");

    // Smooth playback optimization
    Object.values(sounds.current).forEach((s) => {
      if (s) s.preload = "auto";
    });

    return () => {
      Object.values(sounds.current).forEach((s) => {
        if (s) {
          s.pause();
          s.src = ""; // Clean up memory
        }
      });
    };
  }, []);

  // 2. Background Music Management
  useEffect(() => {
    const bg = sounds.current.bg;
    if (!bg) return;

    bg.loop = true;
    bg.volume = 0.5;

    if (gameState === "PLAY") {
      bg.play().catch(() => console.log("Audio waiting for user interaction"));
    } else {
      bg.pause();
      if (gameState !== "PAUSE") bg.currentTime = 0;
    }
  }, [gameState]);

  // 3. Load Word Data
  useEffect(() => {
    fetch("./data/wordsForRunning.json")
      .then((res) => res.json())
      .then((data) => setWordData(data))
      .catch((err) => console.error("JSON Load Error", err));
  }, []);

  const getNextWord = useCallback(
    (lang, lvKey) => {
      if (!wordData?.[lang]?.[lvKey]) return "GO!";
      const list = wordData[lang][lvKey];
      return list[Math.floor(Math.random() * list.length)];
    },
    [wordData],
  );

  const initRace = (lvKey) => {
    const lv = LEVELS[lvKey];
    setLevel(lv);
    setPlayerX(0);
    setAiX(0);
    setTyped("");
    setCombo(0);
    setIsError(false);
    setIsFinishing(false);
    setWord(getNextWord(selectedLang, lvKey));
    setGameState("PLAY");
  };

  // 4. AI & Progress Logic
  useEffect(() => {
    let interval;
    if (gameState === "PLAY") {
      interval = setInterval(() => {
        setAiX((prev) => {
          const gap = playerX - prev;
          let boost =
            gap > 800
              ? level.aiSpeed * 1.5
              : gap < -300
                ? -level.aiSpeed * 0.5
                : 0;
          return prev + (level.aiSpeed + boost) * 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [gameState, level.aiSpeed, playerX]);

  // 5. Victory/Lose Logic
  useEffect(() => {
    if (gameState === "PLAY") {
      if (!isFinishing && playerX >= level.dist - 1000) setIsFinishing(true);

      if (playerX >= level.dist) {
        setGameState("WIN");
        const s = sounds.current.win;
        if (s) {
          s.currentTime = 0;
          s.play().catch(() => {});
        }
      } else if (aiX >= level.dist && !isFinishing) {
        setGameState("LOSE");
        const s = sounds.current.lose;
        if (s) {
          s.currentTime = 0;
          s.play().catch(() => {});
        }
      }

      if (isFinishing) {
        const t = setTimeout(() => setPlayerX((p) => p + 25), 20);
        return () => clearTimeout(t);
      }
    }
  }, [playerX, aiX, level.dist, gameState, isFinishing]);

  // 6. Typing Logic
  useEffect(() => {
    const handleKey = (e) => {
      if (gameState !== "PLAY" || isFinishing) return;

      if (e.key === "Backspace") {
        setTyped((p) => p.slice(0, -1));
        setIsError(false);
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const normalizedLevelKey = level.label.replace(" ", "_");
        if (typed.trim() === word) {
          setPlayerX((p) => p + 800);
          setCombo((c) => c + 1);
          setTyped("");
          setWord(getNextWord(selectedLang, normalizedLevelKey));
          setIsError(false);
        } else {
          setIsError(true);
          setCombo(0);
          const s = sounds.current.wrong;
          if (s) {
            s.currentTime = 0;
            s.play().catch(() => {});
          }
          screenControls.start({
            x: [-10, 10, 0],
            transition: { duration: 0.1 },
          });
        }
        return;
      }
      if (e.key.length === 1) setTyped((p) => p + e.key);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    gameState,
    word,
    typed,
    selectedLang,
    level,
    isFinishing,
    getNextWord,
    screenControls,
  ]);

  return (
    <motion.div
      animate={screenControls}
      className="fixed inset-0 bg-zinc-950 text-white select-none overflow-hidden flex flex-col"
    >
      {/* HUD Bar */}
      <div className="h-20 bg-zinc-900 border-b border-white/10 flex items-center px-8 justify-between z-50">
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 font-bold"
          >
            EXIT
          </button>
          <button
            onClick={() =>
              setGameState((s) => (s === "PLAY" ? "PAUSE" : "PLAY"))
            }
            className="px-6 py-2 bg-blue-600 rounded-lg font-black"
          >
            {gameState === "PAUSE" ? "▶️ RESUME" : "⏸️ PAUSE"}
          </button>
        </div>
        <div className="flex-1 mx-10 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${(playerX / level.dist) * 100}%` }}
          />
        </div>
        <div className="text-blue-500 font-black italic">
          {selectedLang} - {level.label}
        </div>
      </div>

      {/* Arena */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col justify-center">
        {/* Track System - Performance optimized with will-change */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ willChange: "transform" }}
        >
          {/* Moving Lane - ခြေထောက်နဲ့ ထပ်တူကျအောင် 70% မှာ ကပ်ထားပါတယ် */}
          <motion.div
            animate={
              gameState === "PLAY"
                ? {
                    backgroundPositionX: ["0px", "-320px"], // ရှေ့ကို ပြေးနေတဲ့ feeling
                    backgroundPositionY: ["-10px", "10px"], // ဘယ်ညာ တုန်ခါနေတဲ့ feeling
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
              marginTop: "-3rem", // Runner ရဲ့ ခြေထောက် အနေအထားနဲ့ တိတိကျကျ ချိန်ညှိထားခြင်း
              backgroundImage: `linear-gradient(90deg, #3b82f6 0%, #3b82f6 60%, transparent 60%)`,
              backgroundSize: "160px 100%",
              opacity: 0.8,
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
            }}
          />
        </div>

        {/* Flag Pole - ပန်းတိုင်တိုင် */}
        <div
          className="absolute z-30"
          style={{
            bottom: "30%",
            left: "50%",
            transform: `translateX(${(level.dist - playerX) * 2}px)`,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-2 h-72 bg-zinc-400 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
            <div className="absolute top-4 left-2 text-8xl drop-shadow-2xl">
              🏁
            </div>
          </div>
        </div>

        {/* AI Runner */}
        <motion.div
          className="absolute z-10 left-1/2"
          style={{ bottom: "30%" }}
          animate={{
            x: Math.max(-450, Math.min(150, aiX - playerX - 350)),
            y: gameState === "PLAY" ? [0, 2, 0] : 0, // ဘယ်ညာရွေ့ရင် Character ပါ လိုက်တုန်အောင်
          }}
          transition={{
            x: { type: "spring", stiffness: 40, damping: 15 },
            y: { repeat: Infinity, duration: 0.5 },
          }}
        >
          {/* ... (AI Bot UI content အရင်အတိုင်း) ... */}
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
            {/* AI Runner ရဲ့ 🏃‍♂️ အောက်မှာ ထည့်ရန် */}
            {gameState === "PLAY" && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0.8, 2, 0.5],
                      opacity: [0, 1, 0],
                      x: [0, -100], // <--- Positive ကနေ Negative (-150) ပြောင်းလိုက်တာပါ
                      y: [0, -20],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.15,
                      ease: "easeOut",
                    }}
                    className="absolute bottom-0 left-1/2 w-5 h-5 bg-orange-200/40 rounded-full blur-[5px]"
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Player Runner */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ bottom: "30%" }}
          animate={
            gameState === "PLAY"
              ? {
                  x: ["-50%", "-48%", "-52%", "-50%"], // ဘယ်ညာ တုန်ခါမှု ထည့်ထားပါတယ်
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center relative">
            {/* Word Bubbles - (စာရိုက်တဲ့အပိုင်း အရင်အတိုင်းထားပါသည်) */}
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
              <div className=" scale-x-[-1] absolute top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[14px] font-black px-2 py-0.5 rounded-full shadow-md">
                Player
              </div>
            </motion.div>
            {/* Player Runner ရဲ့ 🏃‍♂️ အောက်မှာ ထည့်ရန် */}
            {gameState === "PLAY" && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0.8, 2, 0.5],
                      opacity: [0, 1, 0],
                      x: [0, -130], // <--- Positive ကနေ Negative (-150) ပြောင်းလိုက်တာပါ
                      y: [0, -20],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.5,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute bottom-0 left-1/2 w-6 h-6 bg-blue-200/30 rounded-full blur-[6px]"
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals & Overlays (Pause, Start, Win, Lose) */}
      <AnimatePresence>
        {gameState === "PAUSE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] text-center max-w-sm w-full"
            >
              <h2 className="text-zinc-500 font-bold tracking-[0.3em] text-xs mb-6 uppercase">
                Game Paused
              </h2>
              <div className="bg-zinc-800/50 p-6 rounded-[2.5rem] border border-white/5 mb-8">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 mx-auto mb-4">
                  <img
                    src={Profile}
                    alt="Dev"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://ui-avatars.com/api/?name=Dev")
                    }
                  />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">
                  Oakkar Nyunt
                </h3>
                <p className="text-blue-400 text-sm mb-3">Lead Developer</p>
                <div className="text-zinc-400 text-xs font-mono bg-black/30 py-2 px-4 rounded-full">
                  📧 oakkarnyunt@gmail.com
                </div>
              </div>
              <button
                onClick={() => setGameState("PLAY")}
                className="w-full py-4 bg-blue-600 rounded-2xl font-black text-lg shadow-lg"
              >
                RESUME RACE
              </button>
              <button
                onClick={onBack}
                className="mt-4 text-zinc-500 text-sm font-bold"
              >
                Quit Game
              </button>
            </motion.div>
          </motion.div>
        )}

        {["START", "LANG_SELECT", "LEVEL_SELECT", "WIN", "LOSE"].includes(
          gameState,
        ) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center"
          >
            <div className="bg-zinc-900 p-12 rounded-[3rem] text-center border border-white/10 w-full max-w-md">
              {gameState === "START" && (
                <>
                  <h1 className="text-5xl font-black mb-10 text-blue-500 italic">
                    MARATHON
                  </h1>
                  <button
                    onClick={() => setGameState("LANG_SELECT")}
                    className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xl"
                  >
                    START RACE
                  </button>
                </>
              )}
              {gameState === "LANG_SELECT" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">SELECT LANGUAGE</h2>
                  <div className="grid gap-4">
                    <button
                      onClick={() => {
                        setSelectedLang("ENGLISH");
                        setGameState("LEVEL_SELECT");
                      }}
                      className="p-5 bg-zinc-800 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      ENGLISH
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLang("MYANMAR");
                        setGameState("LEVEL_SELECT");
                      }}
                      className="p-5 bg-zinc-800 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      မြန်မာစာ
                    </button>
                  </div>
                </>
              )}
              {gameState === "LEVEL_SELECT" && (
                <>
                  <h2 className="text-2xl font-bold mb-6">SELECT DIFFICULTY</h2>
                  <div className="grid gap-3">
                    {Object.keys(LEVELS).map((k) => (
                      <button
                        key={k}
                        onClick={() => initRace(k)}
                        className="p-4 bg-zinc-800 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                      >
                        {k}
                      </button>
                    ))}
                    <button
                      onClick={() => setGameState("LANG_SELECT")}
                      className="mt-4 text-zinc-500 underline"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
              {(gameState === "WIN" || gameState === "LOSE") && (
                <div className="flex flex-col items-center">
                  <h1
                    className={`text-6xl font-black mb-8 italic ${gameState === "WIN" ? "text-green-500" : "text-red-500"}`}
                  >
                    {gameState}!
                  </h1>

                  {/* Profile Card for Win/Lose Screen */}
                  <div className="bg-zinc-800/50 p-6 rounded-[2.5rem] border border-white/5 mb-8 w-full">
                    <div className="relative inline-block mb-4">
                      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mx-auto bg-zinc-700">
                        <img
                          src={Profile}
                          alt="Developer"
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.target.src =
                              "https://ui-avatars.com/api/?name=Dev&background=3b82f6&color=fff")
                          }
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">
                      Oakkar Nyunt
                    </h3>
                    <p className="text-blue-400 text-xs font-medium mb-3">
                      Lead Developer
                    </p>
                    <div className="text-zinc-400 text-[12px] font-mono bg-black/30 py-2 px-4 rounded-full inline-block border border-white/5">
                      📧 oakkarnyunt@gmail.com
                    </div>
                  </div>

                  <button
                    onClick={() => setGameState("START")}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
