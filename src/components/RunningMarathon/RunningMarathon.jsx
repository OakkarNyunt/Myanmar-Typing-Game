import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

const LEVELS = {
  EASY: { aiSpeed: 1.2, dist: 15000, label: "EASY" },
  MEDIUM: { aiSpeed: 2.2, dist: 25000, label: "MEDIUM" },
  HARD: { aiSpeed: 3.2, dist: 35000, label: "HARD" },
  VERY_HARD: { aiSpeed: 4.2, dist: 45000, label: "VERY HARD" },
};

export default function SprintMarathon({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START"); // START, LANG_SELECT, LEVEL_SELECT, PLAY, PAUSE, WIN, LOSE
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
  const sounds = useRef({
    type: new Audio("./sounds/typingsound.mp3"),
    wrong: new Audio("./sounds/wrongtype.wav"),
    win: new Audio("./sounds/gamee-win.wav"),
    lose: new Audio("./sounds/lose.wav"),
  });

  useEffect(() => {
    fetch("./data/wordsForRunning.json")
      .then((res) => res.json())
      .then((data) => setWordData(data))
      .catch((err) => console.error("JSON Load Error", err));
  }, []);

  const getNextWord = useCallback(
    (lang, lv) => {
      if (!wordData?.[lang]?.[lv]) return "GO!";
      const list = wordData[lang][lv];
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

  // AI & Progress Logic
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

  // Victory Logic
  useEffect(() => {
    if (gameState === "PLAY") {
      if (!isFinishing && playerX >= level.dist - 1000) setIsFinishing(true);
      if (playerX >= level.dist) {
        setGameState("WIN");
        sounds.current.win.play().catch(() => {});
      }
      if (aiX >= level.dist && !isFinishing) {
        setGameState("LOSE");
        sounds.current.lose.play().catch(() => {});
      }
      if (isFinishing) {
        const t = setTimeout(() => setPlayerX((p) => p + 25), 20);
        return () => clearTimeout(t);
      }
    }
  }, [playerX, aiX, level.dist, gameState, isFinishing]);

  // Multi-lang Typing (Space/Enter to submit)
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
        if (typed.trim() === word) {
          setPlayerX((p) => p + 800);
          setCombo((c) => c + 1);
          setTyped("");
          setWord(getNextWord(selectedLang, level.label.replace(" ", "_")));
          setIsError(false);
          sounds.current.type.currentTime = 0;
          sounds.current.type.play().catch(() => {});
        } else {
          setIsError(true);
          setCombo(0);
          sounds.current.wrong.play().catch(() => {});
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
        {/* Perspective Road */}
        <div className="absolute inset-0" style={{ perspective: "600px" }}>
          <div
            className="absolute inset-0 w-full h-[200%] origin-top"
            style={{
              transform: "rotateX(60deg)",
              backgroundImage: `linear-gradient(90deg, transparent 49%, white 50%, transparent 51%), linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.05) 21%, transparent 22%)`,
              backgroundSize: "100% 120px",
              backgroundPosition: `0px ${playerX}px`,
              backgroundColor: "#0f172a",
            }}
          />
        </div>

        {/* Flag Pole */}
        <div
          className="absolute z-30"
          style={{
            bottom: "35%",
            left: "50%",
            transform: `translateX(${(level.dist - playerX) * 2}px)`,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-2 h-72 bg-zinc-400 rounded-full" />
            <div className="absolute top-4 left-2 text-8xl">🏁</div>
          </div>
        </div>

        {/* Player & AI */}
        <motion.div
          className="absolute z-10 left-1/2"
          style={{ bottom: "30%" }}
          animate={{ x: aiX - playerX - 350 }}
        >
          <div className="flex flex-col items-center opacity-50">
            <div className="text-[10rem] scale-x-[-1]">🏃‍♂️</div>
          </div>
        </motion.div>

        <div
          className="absolute left-1/2 -translate-x-1/2 z-20"
          style={{ bottom: "30%" }}
        >
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {gameState === "PLAY" && !isFinishing && (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.5, y: -100 }}
                  className="mb-10 bg-white p-8 rounded-4xl border-4 border-blue-500 text-center shadow-2xl min-w-75"
                >
                  <div className="text-6xl font-black text-zinc-900 mb-4">
                    {word}
                  </div>
                  <div className="h-14 bg-zinc-100 rounded-2xl flex items-center px-6 border-2 border-zinc-200">
                    <span
                      className={`text-3xl font-bold ${isError ? "text-red-500" : "text-blue-600"}`}
                    >
                      {typed}
                      <span className="animate-ping">|</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              animate={gameState === "PLAY" ? { y: [0, -20, 0] } : {}}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="text-[10rem] scale-x-[-1] drop-shadow-2xl"
            >
              🏃‍♂️
            </motion.div>
          </div>
        </div>
      </div>

      {/* Menu Overlays */}
      <AnimatePresence>
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
                        className="p-4 bg-zinc-800 rounded-xl font-bold hover:bg-blue-600"
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
                <>
                  <h1 className="text-6xl font-black mb-6 text-blue-500">
                    {gameState}!
                  </h1>
                  <button
                    onClick={() => setGameState("START")}
                    className="w-full py-5 bg-blue-600 rounded-2xl font-black"
                  >
                    PLAY AGAIN
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
