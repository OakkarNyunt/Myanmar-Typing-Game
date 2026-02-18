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
import useSound from "use-sound";
import wordsData from "@/data/words.json";

// ၁။ အသံဖိုင်တွေကို ဒီမှာ တိုက်ရိုက် import လုပ်ပါ (src/assets ထဲမှာ ရှိရင် ပိုကောင်းပါတယ်)
// တကယ်လို့ public ထဲမှာပဲ ထားချင်ရင် path ကို သေချာစစ်ပါ
import bgMusic from "@/assets/sounds/bg-music.mp3";
import shotSound from "@/assets/sounds/shot.mp3";
import gameOverSound from "@/assets/sounds/gameover.wav";
import countDownSound from "@/assets/sounds/countdown.wav";

import profile from "@/assets/images/Profile.jpg";
import logo from "@/assets/images/mtpro.png";

// Configurations
const BIRD_COLORS = [
  "text-blue-500",
  "text-red-500",
  "text-green-500",
  "text-yellow-500",
  "text-purple-500",
  "text-pink-500",
  "text-orange-500",
];
const BIRD_EMOJIS = ["🐦", "🦜", "🕊️", "🦆", "🦉", "🦅"];

// UI Components
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
  // --- STATES ---
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, Go ပြဖို့
  const [gameState, setGameState] = useState("menu");
  const [isPaused, setIsPaused] = useState(false);
  const [birds, setBirds] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [speedMultiplier, setSpeedMultiplier] = useState(0.5);
  const [gameWords, setGameWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("birdShooterHighScore")) || 0,
  );

  // --- SOUND EFFECTS ---
  const [playBg, { stop: stopBg, pause: pauseBg }] = useSound(bgMusic, {
    volume: 0.2,
    loop: true,
  });
  const [playShot] = useSound(shotSound, { volume: 0.5 });
  const [playGameOver] = useSound(gameOverSound, { volume: 0.5 });
  const [playcountdown] = useSound(countDownSound, { volume: 0.5 });

  // --- MUSIC LOGIC ---
  // Pause/Play လုပ်တဲ့အခါ အသံကို ထိန်းချုပ်ဖို့
  useEffect(() => {
    if (gameState === "playing") {
      if (!isPaused) {
        playBg(); // Resume music
      } else {
        pauseBg(); // Pause music instead of stop
      }
    } else {
      stopBg(); // Stop music for Menu/GameOver
    }
  }, [gameState, isPaused, playBg, pauseBg, stopBg]);

  // --- FUNCTIONS ---
  const resetGame = () => {
    stopBg();
    setBirds([]);
    setUserInput("");
    setScore(0);
    setLives(5);
    setSpeedMultiplier(0.5); // Level ကို မူလ 0.5 ဆီ ပြန်ပို့မယ်
    setWordIndex(0); // စာလုံးအညွှန်းကိုလည်း Reset လုပ်မယ်
    setIsPaused(false);
    setGameState("menu");
  };

  const startGame = (level) => {
    const baseWords = [...wordsData[level]];
    const shuffledWords = baseWords.sort(() => Math.random() - 0.5);

    setGameWords(shuffledWords);
    setWordIndex(0);
    setScore(0);
    setLives(5);
    setSpeedMultiplier(0.5);
    setBirds([]);

    setGameState("countdown"); // gameState ကို countdown သို့ ပြောင်းမယ်
    let count = 3;
    setCountdown(count);

    playcountdown();

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else if (count === 0) {
        setCountdown("GO!");
      } else {
        clearInterval(timer);
        setCountdown(null);
        setGameState("playing"); // Countdown ပြီးမှ playing သို့ ပြောင်းမယ်
        playBg(); // Music စဖွင့်မယ်
        spawnBird(); // ပထမဆုံးငှက်ကို တန်းလွှတ်မယ်
      }
    }, 800);
  };

  const spawnBird = () => {
    if (gameWords.length === 0) return;
    const currentWord = gameWords[wordIndex % gameWords.length];

    const newBird = {
      id: Date.now() + Math.random(),
      text: currentWord,
      x: -15,
      y: Math.random() * 60 + 10,
      speed: (Math.random() * 0.15 + 0.1) * speedMultiplier,
      status: "flying",
      // ဒီ ၂ ကြောင်း အသစ်ထည့်ပါ
      color: BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)],
      emoji: BIRD_EMOJIS[Math.floor(Math.random() * BIRD_EMOJIS.length)],
    };
    setBirds((prev) => [...prev, newBird]);
    setWordIndex((prev) => prev + 1);
  };

  // --- GAME LOOP ---
  useEffect(() => {
    let gameLoop;
    let spawnInterval;

    if (gameState === "playing" && !isPaused) {
      gameLoop = setInterval(() => {
        setBirds((prev) => {
          return prev
            .map((bird) => {
              if (bird.status === "dying") return { ...bird, y: bird.y + 4 };
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
          // Level တိုးနှုန်းကို 0.005 သို့ လျှော့ချလိုက်ပါ (အရင်က 0.01)
          setSpeedMultiplier((prev) => Math.min(prev + 0.005, 4));
        },
        Math.max(1000, 3000 - speedMultiplier * 900),
      ); // ငှက်ထွက်နှုန်းကိုလည်း နည်းနည်းနှေးလိုက်ပါတယ်
    } else {
      stopBg(); // Stop music if paused or not playing
    }

    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover");
      stopBg();
      playGameOver();
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
    playGameOver,
    stopBg,
  ]);

  const handleInput = (e) => {
    if (isPaused) return;
    const value = e.target.value.trim();
    setUserInput(value);

    const match = birds.find((b) => b.text === value && b.status === "flying");
    if (match) {
      playShot();
      setBirds((prev) =>
        prev.map((b) => (b.id === match.id ? { ...b, status: "dying" } : b)),
      );
      setScore((s) => s + 20);
      setUserInput("");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-6 font-myanmar text-slate-800">
      <div className="w-full max-w-5xl bg-white border-8 border-white shadow-2xl rounded-[3rem] overflow-hidden relative h-187.5 flex flex-col">
        {/* HEADER STATS */}
        <div className="flex justify-between items-center p-6 bg-white border-b-2 border-slate-100 z-50 shadow-sm">
          <div className="flex gap-4 italic font-black text-lg">
            <div className="flex items-center gap-2 text-orange-500 bg-orange-50 px-5 py-2 rounded-full">
              <Flame /> {score}
            </div>
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-5 py-2 rounded-full">
              <Heart fill="currentColor" /> {lives}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Playing ဖြစ်နေချိန်မှာပဲ Pause ကို ပြမယ် */}
            {gameState === "playing" && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-3 rounded-full shadow-md transition-all ${
                  isPaused
                    ? "bg-green-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isPaused ? (
                  <Play fill="currentColor" />
                ) : (
                  <Pause fill="currentColor" />
                )}
              </button>
            )}

            {/* Home Screen (menu) နဲ့ Countdown မဟုတ်တဲ့အချိန်မှာပဲ Reset ကို ပြမယ် (ပြင်ဆင်ပြီး) */}
            {gameState !== "menu" && gameState !== "countdown" && (
              <button
                onClick={resetGame}
                className="p-3 bg-slate-100 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors shadow-md"
              >
                <RotateCcw />
              </button>
            )}
          </div>

          <div className="text-blue-500 font-black flex items-center gap-2 text-xl">
            <Zap size={24} /> LVL: {speedMultiplier.toFixed(1)}
          </div>
        </div>

        {/* GAME AREA */}
        <div className="flex-1 relative overflow-hidden bg-linear-to-b from-sky-400 to-sky-100">
          {/* COUNTDOWN OVERLAY */}

          <AnimatePresence>
            {gameState === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center z-60 bg-black/20 backdrop-blur-[2px]">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                  exit={{ scale: 2, opacity: 0, filter: "blur(10px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`text-9xl font-black ${countdown === "GO!" ? "text-yellow-400" : "text-white"} drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]`}
                >
                  {countdown}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* PLAYING STATE */}
          {/* PLAYING STATE */}
          <AnimatePresence>
            {gameState === "playing" &&
              birds.map((bird) => (
                <motion.div
                  key={bird.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ left: `${bird.x}%`, top: `${bird.y}%` }}
                  className="absolute flex flex-col items-center z-10"
                >
                  <div
                    className={`text-6xl mb-1 ${
                      bird.status === "dying"
                        ? "rotate-180 scale-75"
                        : isPaused
                          ? ""
                          : "animate-bounce"
                    } ${bird.color}`} // 👈 ဒီမှာ bird.color ကို သုံးထားပါတယ်
                  >
                    {/* 🐦 အစား bird.emoji ကို ပြောင်းသုံးလိုက်ပါတယ် */}
                    {bird.status === "dying" ? "😵" : bird.emoji}
                  </div>
                  <div
                    className={`px-5 py-1.5 rounded-full font-bold shadow-xl border-2 text-lg ${
                      bird.status === "dying"
                        ? "bg-red-500 text-white border-red-200"
                        : "bg-white text-slate-700 border-sky-200"
                    }`}
                  >
                    {bird.text}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* MENU STATE */}
          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-6">
              {/* Logo */}
              <div className="absolute top-8 left-8 flex items-center gap-4 bg-white/10 p-3 pr-6 rounded-full backdrop-blur-md border border-white/20">
                <div className="w-16 h-16 bg-white rounded-full overflow-hidden border-2 border-sky-400 shadow-inner">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "🏢")}
                  />
                </div>
                <div className="text-white text-left">
                  <p className="text-xl uppercase font-bold tracking-widest text-blue-300">
                    MT PRO
                  </p>
                  <p className="text-xs font-black italic">
                    Computer Training Center
                  </p>
                </div>
              </div>

              {/* Center Menu */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center space-y-10"
              >
                <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                  BIRD <span className="text-sky-400">SHOOTER</span>
                </h1>
                <div className="text-2xl font-bold text-yellow-300 bg-black/40 px-10 py-3 rounded-full border-2 border-yellow-500/50 shadow-xl inline-block">
                  🏆 HIGH SCORE: {highScore}
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

              {/* Developer */}
              <div className="absolute bottom-4 right-8 flex items-center gap-4 bg-white/10 p-2 pr-6 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-right text-white leading-tight">
                  <p className="text-[10px] uppercase opacity-60 font-bold">
                    Developed By
                  </p>
                  <p className="text-lg font-black">Oakkar Nyunt</p>
                  <p className="text-[10px] opacity-60 font-bold">
                    oakkarnyunt@gmail.com
                  </p>
                </div>
                <div className="size-25 bg-slate-700 rounded-xl overflow-hidden border-2 border-white/30">
                  <img
                    src={profile}
                    alt="Dev"
                    className="w-full h-full object-cover transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER STATE */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-lg z-100 text-white">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-8xl font-black mb-4 animate-pulse">
                  GAME OVER
                </h2>
                <div className="space-y-2 mb-10">
                  <p className="text-4xl font-bold opacity-80">
                    SCORE: {score}
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    BEST: {highScore}
                  </p>
                </div>
                <button
                  onClick={resetGame}
                  className="px-16 py-6 bg-white text-red-600 rounded-3xl font-black text-2xl hover:scale-110 shadow-2xl transition-transform"
                >
                  BACK TO MENU
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* INPUT AREA */}
        {gameState === "playing" && (
          <div className="p-8 bg-white border-t-4 border-slate-50 flex justify-center items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <input
              type="text"
              value={userInput}
              onChange={handleInput}
              autoFocus
              disabled={isPaused}
              className={`
        w-full max-w-2xl border-4 p-6 rounded-4xl
        text-3xl text-center font-bold tracking-wide
        transition-all duration-300
        ${
          isPaused
            ? "bg-slate-100 border-slate-200 text-slate-400 opacity-50"
            : "bg-white border-sky-400 text-slate-800 shadow-[0_0_25px_rgba(56,189,248,0.2)] focus:outline-none focus:ring-4 focus:ring-sky-100"
        }
      `}
              style={{
                fontFamily: "'Pyidaungsu', sans-serif", // မြန်မာစာအတွက် သေချာတဲ့ Font သုံးရန်
                lineHeight: "1.6", // စာလုံးဆင့်တွေ မပြတ်သွားအောင်
                caretColor: "#38bdf8", // ရိုက်နေတဲ့ Cursor အရောင်ကိုပါ ထင်ရှားစေရန်
              }}
              placeholder={
                isPaused ? "ဂိမ်းရပ်ထားပါသည်..." : "ဒီမှာ စာရိုက်ပါ..."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
