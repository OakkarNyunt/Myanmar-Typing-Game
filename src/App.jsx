import React, { useState, useEffect } from "react";
import {
  Flame,
  Target,
  RotateCcw,
  Zap,
  Heart,
  Play,
  Pause,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import wordsData from "@/data/words.json";

// Menu Button Component ကို အပြင်မှာ ထုတ်ထားပေးပါတယ်
function MenuButton({ color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} px-10 py-6 text-white rounded-3xl font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-[0_8px_0_rgb(0,0,0,0.2)] border-b-8 border-black/20`}
    >
      {label}
    </button>
  );
}

export default function BirdShootingGame() {
  const [gameState, setGameState] = useState("menu");
  const [isPaused, setIsPaused] = useState(false);
  const [birds, setBirds] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5);
  const [gameWords, setGameWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);

  // --- High Score ကို LocalStorage ကနေ ဖတ်မယ် ---
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("birdShooterHighScore")) || 0,
  );

  const resetGame = () => {
    setBirds([]);
    setUserInput("");
    setScore(0);
    setLives(5);
    setSpeedMultiplier(0.5);
    setIsPaused(false);
    setGameState("menu");
  };

  const startGame = (level) => {
    let baseWords = [...wordsData[level]];
    let massiveWords = [];
    for (let i = 0; i < 500; i++) {
      massiveWords.push(...baseWords);
    }
    const shuffledWords = massiveWords.sort(() => Math.random() - 0.5);

    setGameWords(shuffledWords);
    setWordIndex(0);
    setScore(0);
    setLives(5);
    setSpeedMultiplier(0.5);
    setGameState("playing");
    setIsPaused(false);
    setBirds([]);
    setUserInput("");
  };

  const spawnBird = () => {
    if (gameWords.length === 0) return;
    const currentWord = gameWords[wordIndex % gameWords.length];
    const newBird = {
      id: Date.now() + Math.random(),
      text: currentWord,
      x: -15,
      y: Math.random() * 60 + 10,
      speed: (Math.random() * 0.3 + 0.2) * speedMultiplier,
      status: "flying",
    };
    setBirds((prev) => [...prev, newBird]);
    setWordIndex((prev) => prev + 1);
  };

  useEffect(() => {
    let gameLoop;
    let spawnInterval;

    if (gameState === "playing" && !isPaused) {
      gameLoop = setInterval(() => {
        setBirds((prev) => {
          return prev
            .map((bird) => {
              if (bird.status === "dying") return { ...bird, y: bird.y + 3 };
              return { ...bird, x: bird.x + bird.speed };
            })
            .filter((bird) => bird.y < 100 && bird.x < 110);
        });

        setBirds((prev) => {
          const missed = prev.find((b) => b.x >= 105 && b.status === "flying");
          if (missed) setLives((l) => Math.max(0, l - 1));
          return prev.filter((b) => b.x < 105);
        });
      }, 30);

      spawnInterval = setInterval(
        () => {
          spawnBird();
          setSpeedMultiplier((prev) => Math.min(prev + 0.01, 4));
        },
        Math.max(1200, 3500 - speedMultiplier * 800),
      );
    }

    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover");
      // High Score စစ်ဆေးပြီး သိမ်းမယ်
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("birdShooterHighScore", score);
      }
    }

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawnInterval);
    };
  }, [
    gameState,
    isPaused,
    speedMultiplier,
    lives,
    gameWords,
    wordIndex,
    score,
    highScore,
  ]);

  const handleInput = (e) => {
    if (isPaused) return;
    const value = e.target.value.trim();
    setUserInput(value);
    const match = birds.find((b) => b.text === value && b.status === "flying");
    if (match) {
      setBirds((prev) =>
        prev.map((b) => (b.id === match.id ? { ...b, status: "dying" } : b)),
      );
      setScore((s) => s + 20);
      setUserInput("");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-6 font-myanmar text-slate-800">
      <div className="w-full max-w-5xl bg-white border-8 border-white shadow-2xl rounded-[3rem] overflow-hidden relative h-[750px] flex flex-col">
        {/* HEADER STATS */}
        <div className="flex justify-between items-center p-6 bg-white border-b-2 border-slate-100 z-50">
          <div className="flex gap-4 italic font-black">
            <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-4 py-2 rounded-full shadow-sm">
              <Flame /> {score}
            </div>
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-full shadow-sm">
              <Heart fill="currentColor" /> {lives}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {gameState === "playing" && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-3 rounded-full shadow-md transition-all ${isPaused ? "bg-green-500 text-white animate-pulse" : "bg-slate-100 text-slate-600"}`}
              >
                {isPaused ? (
                  <Play fill="currentColor" />
                ) : (
                  <Pause fill="currentColor" />
                )}
              </button>
            )}
            <button
              onClick={resetGame}
              className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors shadow-md"
            >
              <RotateCcw />
            </button>
          </div>

          <div className="text-blue-500 font-black flex items-center gap-2">
            <Zap size={20} /> LVL: {speedMultiplier.toFixed(1)}
          </div>
        </div>

        {/* SKY / GAME AREA */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-100">
          {gameState === "playing" &&
            birds.map((bird) => (
              <motion.div
                key={bird.id}
                style={{ left: `${bird.x}%`, top: `${bird.y}%` }}
                className="absolute flex flex-col items-center z-10"
              >
                <div
                  className={`text-5xl mb-1 ${bird.status === "dying" ? "rotate-180 scale-75" : isPaused ? "" : "animate-bounce"}`}
                >
                  {bird.status === "dying" ? "😵" : "🐦"}
                </div>
                <div
                  className={`px-4 py-1 rounded-full font-bold shadow-lg border-2 ${bird.status === "dying" ? "bg-red-500 text-white border-red-200" : "bg-white text-slate-700 border-sky-200"}`}
                >
                  {bird.text}
                </div>
              </motion.div>
            ))}

          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-6">
              {/* Center Logo */}
              <div className="absolute top-8 left-8 flex items-center gap-4 bg-white/10 p-3 pr-6 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-sky-400">
                  <img
                    src="/src/images/mtpro.png"
                    alt="MTPRO Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "🏢")}
                  />
                </div>
                <div className="text-white">
                  <p className="text-xl uppercase tracking-widest opacity-70 font-bold text-sky-300">
                    MT PRO
                  </p>
                  <p className="text-xs font-black italic">
                    Computer Training Center
                  </p>
                </div>
              </div>

              {/* Main Menu Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-8"
              >
                <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] uppercase">
                  Bird <span className="text-sky-400">Shooter</span>
                </h1>

                <div className="text-2xl font-bold text-yellow-300 drop-shadow-lg bg-black/40 px-8 py-3 rounded-full inline-block border-2 border-yellow-500/50">
                  🏆 High Score: {highScore}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <MenuButton
                    color="bg-green-500"
                    label="EASY 🍀"
                    onClick={() => startGame("easy")}
                  />
                  <MenuButton
                    color="bg-orange-500"
                    label="MEDIUM 🔥"
                    onClick={() => startGame("medium")}
                  />
                  <MenuButton
                    color="bg-red-600"
                    label="HARD 💀"
                    onClick={() => startGame("hard")}
                  />
                </div>
              </motion.div>

              {/* Developer Info */}
              <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-white/10 p-2 pr-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
                <div className="text-right text-white">
                  <p className="text-[10px] uppercase tracking-tighter opacity-60 font-bold">
                    Developed By
                  </p>
                  <p className="text-lg font-black leading-tight">
                    Oakkar Nyunt
                  </p>
                </div>
                <div className="w-25 h-25 bg-slate-700 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                  <img
                    src="/src/images/Profile.jpg"
                    alt="Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-lg z-[100] text-white p-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-8xl font-black mb-2 text-red-500 drop-shadow-2xl">
                  GAME OVER
                </h2>
                <div className="space-y-2 mb-10">
                  <p className="text-4xl font-bold opacity-90">
                    Score: {score}
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    Best: {highScore}
                  </p>
                </div>
                <button
                  onClick={resetGame}
                  className="px-14 py-6 bg-white text-red-600 rounded-3xl font-black text-2xl hover:scale-110 active:scale-95 transition-all shadow-2xl"
                >
                  TRY AGAIN
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        {gameState === "playing" && (
          <div className="p-10 bg-white border-t-4 border-slate-50 flex justify-center items-center">
            <input
              type="text"
              value={userInput}
              onChange={handleInput}
              autoFocus
              disabled={isPaused}
              className={`w-full max-w-2xl border-4 p-7 rounded-[2.5rem] text-4xl text-center transition-all ${isPaused ? "bg-slate-50 border-slate-100 opacity-50" : "bg-slate-50 border-sky-100 focus:border-sky-400 focus:bg-white shadow-xl focus:outline-none"}`}
              placeholder={isPaused ? "ဂိမ်းရပ်ထားပါသည်..." : "စာရိုက်ပါ..."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
