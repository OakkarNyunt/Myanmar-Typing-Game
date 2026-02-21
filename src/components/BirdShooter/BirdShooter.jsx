import React, { useState, useEffect } from "react";
import {
  Flame,
  Target,
  RotateCcw,
  Zap,
  Heart,
  Play,
  Pause,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import wordsData from "@/data/words.json";

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

export default function BirdShootingGame({ onBack }) {
  // --- STATES ---
  const [gameMode, setGameMode] = useState("mm");
  const [countdown, setCountdown] = useState(null);
  const [gameState, setGameState] = useState("menu");
  const [isPaused, setIsPaused] = useState(false);
  const [birds, setBirds] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(7);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [gameWords, setGameWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem("birdShooterHighScore")) || 0,
  );

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [killedCount, setKilledCount] = useState(0);

  // --- SOUND EFFECTS ---
  const [playBg, { stop: stopBg, pause: pauseBg }] = useSound(bgMusic, {
    volume: 0.2,
    loop: true,
  });
  const [playShot] = useSound(shotSound, { volume: 0.5 });
  const [playGameOver] = useSound(gameOverSound, { volume: 0.5 });
  const [playcountdown] = useSound(countDownSound, { volume: 0.5 });

  const [seconds, setSeconds] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (gameState === "playing" && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (gameState === "menu") {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  // စက္ကန့်ကို 00:00 format ပြောင်းရန်
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (gameState === "playing") {
      if (!isPaused) {
        playBg();
      } else {
        pauseBg();
      }
    } else {
      stopBg();
    }
  }, [gameState, isPaused, playBg, pauseBg, stopBg]);

  // Bug Fix: spawnBird ကို gameWords (State) အစား dynamicWords (Param) သုံးနိုင်အောင် ပြင်ဆင်ခြင်း
  const spawnBird = (dynamicWords = null, dynamicIndex = null) => {
    const currentWords = dynamicWords || gameWords;
    const currentIndex = dynamicIndex !== null ? dynamicIndex : wordIndex;

    if (!currentWords || currentWords.length === 0) return;

    const currentWord = currentWords[currentIndex % currentWords.length];

    const newBird = {
      id: Date.now() + Math.random(),
      text: currentWord,
      x: -20,
      y: Math.random() * 85 + 5,
      speed: (Math.random() * 0.15 + 0.1) * speedMultiplier,
      status: "flying",
      color: BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)],
      emoji: BIRD_EMOJIS[Math.floor(Math.random() * BIRD_EMOJIS.length)],
    };
    setBirds((prev) => [...prev, newBird]);
    setWordIndex((prev) => prev + 1);
  };

  const startGame = (level) => {
    // ၁။ ချက်ချင်း Clear လုပ်ခြင်း
    setBirds([]);
    setUserInput("");
    setWordIndex(0);
    setScore(0);
    setLives(7);
    setSpeedMultiplier(0.5);
    setSeconds(0); // အချိန်ကို Reset ချလိုက်ခြင်း
    setKilledCount(0); // ပစ်ချထားတဲ့ အရေအတွက်ကို Reset ချခြင်း

    // ၂။ စာလုံးအသစ်များကို Shuffle လုပ်ပါ
    const baseWords = [...wordsData[gameMode][level]];
    const shuffledWords = baseWords.sort(() => Math.random() - 0.5);
    setGameWords(shuffledWords);

    setGameState("countdown");
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
        setGameState("playing");
        playBg();
        // ၃။ ပထမဆုံးငှက်ကို စာလုံးအသစ် (shuffledWords) နဲ့ တိုက်ရိုက် Spawn လုပ်ပါ
        spawnBird(shuffledWords, 0);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      stopBg();
    };
  }, [stopBg]);

  const handleBack = () => {
    stopBg();
    onBack();
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
            .filter((bird) => bird.y < 120 && bird.x < 110);
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
          setSpeedMultiplier((prev) => Math.min(prev + 0.004, 4));
        },
        Math.max(800, 2500 - speedMultiplier * 900),
      );
    } else {
      stopBg();
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
      setKilledCount((prev) => prev + 1); // ငှက်အရေအတွက် တစ်ကောင် တိုးလိုက်ခြင်း
      setUserInput("");
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-0 overflow-hidden font-myanmar">
      <div className="w-full h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {/* HEADER AREA: ကစားနေချိန်မှသာ ပေါ်မည် */}
        <AnimatePresence>
          {gameState === "playing" && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="px-8 py-4 bg-white/40 backdrop-blur-xl border-b border-white/20 flex justify-between items-center z-30 shadow-sm"
            >
              {/* Left: Actions & Score */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-3 bg-white/80 text-slate-600 rounded-2xl hover:bg-white hover:text-sky-500 transition-all active:scale-90 shadow-sm border border-slate-100"
                >
                  <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-2 bg-white/90 p-1.5 pr-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-yellow-400 p-2 rounded-xl shadow-inner">
                    <Target size={20} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                      Score
                    </span>
                    <span className="text-xl font-black text-slate-700 leading-tight">
                      {score}
                    </span>
                  </div>
                </div>
                {/* Killed Count Card */}
                <div className="flex items-center gap-2 bg-white/90 p-1.5 pr-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-orange-500 p-2 rounded-xl shadow-inner">
                    {/* Target Icon သို့မဟုတ် Emoji သုံးနိုင်သည် */}
                    <span className="text-lg leading-none">🎯</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                      Killed
                    </span>
                    <span className="text-xl font-black text-slate-700 leading-tight">
                      {killedCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Stylish Timer */}
              <div className="absolute left-1/2 -translate-x-1/2">
                <div className="bg-slate-900 px-6 py-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-b-4 border-slate-700 flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full animate-pulse ${isPaused ? "bg-slate-500" : "bg-red-500"}`}
                  />
                  <span className="text-2xl font-mono font-black text-white tracking-widest">
                    {formatTime(seconds)}
                  </span>
                </div>
              </div>

              {/* Right: Health & Controls */}
              <div className="flex items-center gap-4">
                {/* Lives Card */}
                <div className="flex items-center gap-2 bg-white/90 p-1.5 pr-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="bg-red-500 p-2 rounded-xl shadow-inner">
                    <Heart size={20} className="text-white fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                      Lives
                    </span>
                    <span className="text-xl font-black text-slate-700 leading-tight">
                      {lives}
                    </span>
                  </div>
                </div>

                {/* Buttons Group */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRestartConfirm(true)}
                    className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all border border-orange-100"
                  >
                    <RotateCcw size={22} />
                  </button>

                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`p-3 rounded-xl shadow-md transition-all ${
                      isPaused
                        ? "bg-green-500 text-white animate-bounce"
                        : "bg-white text-slate-600 border border-slate-100"
                    }`}
                  >
                    {isPaused ? (
                      <Play fill="currentColor" size={22} />
                    ) : (
                      <Pause fill="currentColor" size={22} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GAME AREA */}
        <div
          className={`
    flex-1 relative overflow-hidden bg-linear-to-b from-sky-400 to-sky-100 transition-all duration-500
    ${
      gameState === "playing" && lives === 1
        ? "ring-20 ring-inset ring-red-500/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.4)]"
        : ""
    }
`}
        >
          {/* အသက် ၁ ခုပဲ ကျန်ချိန်မှာ ပေါ်လာမယ့် အနီရောင် Overlay ဖျော့ဖျော့ */}
          {gameState === "playing" && lives === 1 && (
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-0 animate-pulse" />
          )}

          {/* Danger Text Overlay: အသက် ၁ ခုပဲ ကျန်ကြောင်း ခဏပြချင်ရင် */}
          {gameState === "playing" && lives === 1 && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-20">
              <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase animate-bounce shadow-lg">
                Last Life! Be Careful!
              </div>
            </div>
          )}

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

          {gameState === "playing" &&
            birds.map((bird) => (
              <motion.div
                key={bird.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ left: `${bird.x}%`, top: `${bird.y}%` }}
                className="absolute flex items-center z-10"
              >
                <div
                  className={`relative z-20 px-4 py-1.5 rounded-xl font-bold shadow-lg border-2 text-lg transition-all duration-500 ${
                    bird.status === "dying"
                      ? "bg-yellow-400 text-white border-yellow-200 scale-0 opacity-0 rotate-12"
                      : "bg-white text-slate-800 border-slate-100 shadow-md"
                  }`}
                >
                  {bird.text}
                </div>

                <div
                  className={`z-10 -mr-2 -ml-1 transition-opacity duration-300 ${bird.status === "dying" ? "opacity-0" : "opacity-100"}`}
                >
                  <svg width="45" height="12" viewBox="0 0 45 12" fill="none">
                    <path
                      d="M0 6C3.75 6 3.75 2 7.5 2C11.25 2 11.25 10 15 10C18.75 10 18.75 2 22.5 2C26.25 2 26.25 10 30 10C33.75 10 33.75 2 37.5 2C41.25 2 41.25 6 45 6"
                      stroke="#64748b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="opacity-60"
                    />
                  </svg>
                </div>

                <div
                  className={`text-4xl inline-block transition-all duration-500 ${
                    bird.status === "dying"
                      ? "scale-[2.5] opacity-0 rotate-360deg blur-sm"
                      : isPaused
                        ? ""
                        : "animate-bounce"
                  } ${bird.color}`}
                  style={{
                    marginLeft: "-4px",
                    lineHeight: "0.8",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {bird.status === "dying" ? "✨" : bird.emoji}
                </div>
              </motion.div>
            ))}

          <AnimatePresence>
            {showRestartConfirm && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-orange-400 max-w-sm w-full text-center relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full opacity-50"></div>

                  <div className="relative z-10">
                    <div className="text-6xl mb-4">🛸</div>
                    <h3 className="text-2xl font-black text-slate-800 mb-4">
                      ပြန်စတော့မလား?
                    </h3>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          setGameState("menu");
                          setBirds([]);
                          setUserInput("");
                          setShowRestartConfirm(false);
                        }}
                        className="py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none transition-all"
                      >
                        အစက ပြန်စမယ်!
                      </button>

                      <button
                        onClick={() => setShowRestartConfirm(false)}
                        className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-xl transition-all"
                      >
                        မလုပ်တော့ဘူး
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-6">
              <div className="absolute top-8 left-8 flex items-center gap-4 bg-white/10 p-3 pr-6 rounded-full backdrop-blur-md border border-white/20">
                <div className="w-25 h-25 bg-white rounded-full overflow-hidden border-2 border-sky-400 shadow-inner">
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

              <div className="flex bg-white/10 p-2 rounded-3xl backdrop-blur-xl border border-white/20 mt-4 shadow-2xl">
                <button
                  onClick={() => setGameMode("mm")}
                  className={`px-8 py-3 rounded-2xl font-black transition-all ${gameMode === "mm" ? "bg-sky-500 text-white shadow-lg" : "text-white hover:bg-white/10"}`}
                >
                  မြန်မာ
                </button>
                <button
                  onClick={() => setGameMode("en")}
                  className={`px-8 py-3 rounded-2xl font-black transition-all ${gameMode === "en" ? "bg-sky-500 text-white shadow-lg" : "text-white hover:bg-white/10"}`}
                >
                  English
                </button>
              </div>

              <div className="absolute bottom-4 right-8 flex items-center gap-4 bg-white/10 p-2 pr-6 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-right text-white leading-tight space-y-2">
                  <p className="text-[10px] uppercase opacity-60 font-bold">
                    Developed By
                  </p>
                  <p className="text-lg font-black">Oakkar Nyunt</p>
                  <p className="text-[12px] opacity-60 font-bold">
                    oakkarnyunt@gmail.com
                  </p>
                </div>
                <div className="size-40 bg-slate-700 rounded-xl overflow-hidden border-2 border-white/30">
                  <img
                    src={profile}
                    alt="Dev"
                    className="w-full h-full object-cover transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-60 flex flex-col items-center justify-center p-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-blue-500 flex flex-col items-center gap-6 w-full max-w-lg"
              >
                {/* Header Info */}
                <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-6 w-full justify-center">
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "🏢")}
                    />
                  </div>

                  <div className="text-slate-800 text-left space-y-1">
                    <p className="text-2xl uppercase font-black tracking-widest text-blue-600 leading-none">
                      MT PRO
                    </p>
                    <p className="text-[13px] font-black italic text-slate-500">
                      Computer Training Center
                    </p>
                    <p className="text-[11px] font-bold text-slate-400">
                      တံတား-၂ မီးပွိုင့်အနီး၊ တာချီလိတ်မြို့။
                    </p>
                  </div>
                </div>

                {/* Stats Section: Score & Killed Count */}
                <div className="text-center w-full space-y-4">
                  <h2 className="text-4xl font-black text-red-600 tracking-tight">
                    GAME OVER
                  </h2>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-4xl border border-slate-100">
                    <div className="flex flex-col items-center justify-center p-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Total Score
                      </span>
                      <span className="text-3xl font-black text-slate-800">
                        {score}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 border-l border-slate-200">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Birds Killed
                      </span>
                      <span className="text-3xl font-black text-orange-500">
                        🎯 {killedCount}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-sky-600 bg-sky-50 py-1 px-4 rounded-full inline-block">
                    🏆 Best Score: {highScore}
                  </p>
                </div>

                {/* Developer Card */}
                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl w-full border border-slate-100">
                  <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={profile}
                      alt="Dev"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left text-slate-800">
                    <p className="text-[10px] uppercase opacity-60 font-bold">
                      Developed By
                    </p>
                    <p className="text-xl font-black">Oakkar Nyunt</p>
                    <p className="text-[12px] opacity-70 font-medium italic">
                      oakkarnyunt@gmail.com
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(22,163,74)] transition-all active:translate-y-1 active:shadow-none"
                >
                  ပြန်လည်စတင်မည်
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {gameState === "playing" && isPaused && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4 border-sky-400 flex flex-col items-center gap-6 w-full max-w-lg"
            >
              <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-6 w-full justify-center">
                <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "🏢")}
                  />
                </div>
                <div className="text-slate-800 text-left space-y-2">
                  <p className="text-2xl uppercase font-black tracking-widest text-blue-600">
                    MT PRO
                  </p>
                  <p className="text-[14px] font-black italic text-slate-500">
                    Computer Training Center
                  </p>
                  <p className="text-[12px] font-black  text-slate-500">
                    09978209906
                  </p>
                  <p className="text-[12px] font-black  text-slate-500">
                    တံတား-၂ မီးပွိုင့်အနီး၊ တာချီလိတ်မြို့။
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-5xl font-black text-slate-800 mb-2">
                  PAUSED
                </h2>
                <div className="h-1.5 w-20 bg-sky-400 mx-auto rounded-full"></div>
              </div>

              <button
                onClick={() => setIsPaused(false)}
                className="group relative flex items-center justify-center w-24 h-24 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-[0_10px_25px_rgba(34,197,94,0.4)] transition-all active:scale-90"
              >
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
                <Play
                  fill="currentColor"
                  size={48}
                  className="relative z-10 ml-2"
                />
              </button>
              <p className="text-green-600 font-black text-xl animate-pulse">
                ဆက်ကစားမည်
              </p>

              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl w-full border border-slate-100">
                <div className="w-25 h-25 bg-white rounded-xl overflow-hidden border-2 border-white shadow-md">
                  <img
                    src={profile}
                    alt="Dev"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left text-slate-800 leading-tight">
                  <p className="text-[10px] uppercase opacity-60 font-bold mb-1">
                    Developed By
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    Oakkar Nyunt
                  </p>
                  <p className="text-[12px] opacity-70">
                    oakkarnyunt@gmail.com
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="p-10 bg-linear-to-t from-slate-50 to-white border-t-2 border-slate-100 flex justify-center items-center shadow-[0_-15px_30px_rgba(0,0,0,0.03)] relative">
            {/* Input Wrapper: ပိုမိုလှပစေရန် Container တစ်ခု ထပ်ပတ်ထားပါသည် */}
            <div className="relative w-full max-w-2xl group transition-all duration-300">
              {/* Input Icon: ဘယ်ဘက်က ပစ်မှတ် Icon လေး */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-400 z-10 group-focus-within:scale-110 transition-transform duration-300">
                <Target
                  size={32}
                  className={isPaused ? "text-slate-300" : "animate-pulse"}
                />
              </div>

              <input
                type="text"
                value={userInput}
                onChange={handleInput}
                autoFocus
                disabled={isPaused}
                className={`
          w-full pl-18 pr-8 py-6 rounded-[2.5rem]
          text-3xl text-center font-black tracking-wide
          transition-all duration-500 border-b-8
          ${
            isPaused
              ? "bg-slate-100 border-slate-200 text-slate-300 opacity-60 cursor-not-allowed"
              : "bg-white border-sky-500 text-slate-800 shadow-[0_10px_40px_rgba(56,189,248,0.15)] focus:outline-none focus:border-sky-600 focus:scale-[1.02] active:scale-[0.98]"
          }
        `}
                style={{
                  fontFamily: "'Pyidaungsu', sans-serif",
                  lineHeight: "1.6",
                  caretColor: "#38bdf8",
                  letterSpacing: "0.05em",
                }}
                placeholder={
                  isPaused
                    ? "ဂိမ်းရပ်ထားပါသည်..."
                    : "စာလုံးကို မှန်အောင်ရိုက်ပါ..."
                }
              />

              {/* Input Glow Effect: စာရိုက်နေစဉ် နောက်ခံ မီးရောင်ဖျော့ဖျော့လေးလင်းနေစေရန် */}
              {!isPaused && (
                <div className="absolute -inset-1 bg-sky-400 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-10 transition duration-500 -z-10"></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
