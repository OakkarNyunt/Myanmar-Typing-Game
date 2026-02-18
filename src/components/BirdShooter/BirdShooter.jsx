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

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

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

    // အမြင့် (Y) နေရာကို ၅% ကနေ ၉၀% အထိ ပိုကျယ်အောင် ခွာလိုက်ပါတယ်
    // ဒါဆိုရင် ငှက်တွေက တစ်နေရာတည်း စုမနေဘဲ အပေါ်အောက် ပြန့်ထွက်လာမှာပါ
    const newBird = {
      id: Date.now() + Math.random(),
      text: currentWord,
      x: -20,
      y: Math.random() * 85 + 5, // ၅% မှ ၉၀% အတွင်း Random ထွက်လာပါလိမ့်မယ်
      speed: (Math.random() * 0.15 + 0.1) * speedMultiplier,
      status: "flying",
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
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-0 overflow-hidden font-myanmar">
      <div className="w-full h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {/* HEADER AREA */}

        <div className="p-6 bg-white/80 backdrop-blur-md border-b-2 border-slate-100 flex justify-between items-center z-30">
          <div className="flex gap-8">
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-3xl">🏆</span>
              <span className="text-2xl font-black text-slate-700">
                {score}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-3xl">❤️</span>
              <span className="text-2xl font-black text-slate-700">
                {lives}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Restart Button */}
            {gameState === "playing" && (
              <button
                onClick={() => setShowRestartConfirm(true)} // Confirm Box လေးကို ဖွင့်လိုက်မယ်
                className="p-4 bg-orange-100 text-orange-600 rounded-2xl hover:bg-orange-200 transition-all active:scale-90 shadow-sm"
              >
                <RotateCcw size={28} />
              </button>
            )}
            {/* ၂။ Pause/Play Button */}
            {gameState === "playing" && (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-4 rounded-2xl shadow-lg transition-all ${
                  isPaused
                    ? "bg-green-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isPaused ? (
                  <Play fill="currentColor" size={28} />
                ) : (
                  <Pause fill="currentColor" size={28} />
                )}
              </button>
            )}
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
          <AnimatePresence>
            {gameState === "playing" &&
              birds.map((bird) => (
                <motion.div
                  key={bird.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ left: `${bird.x}%`, top: `${bird.y}%` }}
                  className="absolute flex items-center z-10"
                >
                  {/* ၁။ စာလုံး Box */}
                  <div
                    className={`relative z-20 px-4 py-1.5 rounded-xl font-bold shadow-lg border-2 text-lg transition-all duration-500 ${
                      bird.status === "dying"
                        ? "bg-yellow-400 text-white border-yellow-200 scale-0 opacity-0 rotate-12"
                        : "bg-white text-slate-800 border-slate-100 shadow-md"
                    }`}
                  >
                    {bird.text}
                  </div>

                  {/* ၂။ ကြိုးလေး */}
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

                  {/* ၃။ ငှက်ကလေး (သေသွားတဲ့ပုံစံကို Effect ပြောင်းထားသည်) */}
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
                    {/* Status သေသွားရင် ကြယ်ပွင့်လေး သို့မဟုတ် အမွေးပွလေး ပုံစံပြောင်းပါမယ် */}
                    {bird.status === "dying" ? "✨" : bird.emoji}
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* CUSTOM CONFIRM MODAL */}
          <AnimatePresence>
            {showRestartConfirm && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-orange-400 max-w-sm w-full text-center relative overflow-hidden"
                >
                  {/* အလှဆင် တိမ်တိုက်ပုံစံ Background လေး */}
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

          {/* MENU STATE */}
          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-6">
              {/* Logo */}
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

          {/* GAME OVER STATE */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-60 flex flex-col items-center justify-center p-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-blue-500 flex flex-col items-center gap-8 w-full max-w-lg"
              >
                {/* ၁။ Logo */}
                <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-6 w-full justify-center">
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md">
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

                {/* ၂။ Score */}
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-black text-red-600">
                    GAME OVER
                  </h2>
                  <p className="text-3xl font-bold text-slate-800">
                    ရမှတ်: {score}
                  </p>
                  <p className="text-lg font-bold text-orange-500">
                    High Score: {highScore}
                  </p>
                </div>

                {/* ၃။ Profile */}
                <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl w-full border border-slate-100">
                  <div className="w-30 h-30 bg-white rounded-2xl overflow-hidden border-4 border-white shadow-lg">
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
                    <p className="text-[12px] opacity-70">
                      oakkarnyunt@gmail.com
                    </p>
                  </div>
                </div>

                {/* ၄။ ပြန်လည်စတင်မည် Button */}
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95"
                >
                  ပြန်လည်စတင်မည်
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* PAUSE OVERLAY (Center Content) */}
        {gameState === "playing" && isPaused && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.3)] border-4 border-sky-400 flex flex-col items-center gap-6 w-full max-w-lg"
            >
              {/* ၁။ Logo Section */}
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

              {/* ၂။ Pause Title */}
              <div className="text-center">
                <h2 className="text-5xl font-black text-slate-800 mb-2">
                  PAUSED
                </h2>
                <div className="h-1.5 w-20 bg-sky-400 mx-auto rounded-full"></div>
              </div>

              {/* ၃။ ဆက်ကစားမည် (Play Button) */}
              <button
                onClick={() => setIsPaused(false)}
                className="group relative flex items-center justify-center w-24 h-24 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-[0_10px_25px_rgba(34,197,94,0.4)] transition-all active:scale-90"
              >
                {/* ခလုတ်ဘေးက လှိုင်းတွန့် Effect */}
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

              {/* ၄။ Developer Profile Section */}
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
