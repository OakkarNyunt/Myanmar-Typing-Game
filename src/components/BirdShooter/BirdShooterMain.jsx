import React, { useState, useEffect, useCallback } from "react";
import { Target, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSound from "use-sound";
import wordsData from "@/data/words.json";

// Components
import Bird from "@/components/BirdShooter/Bird";
import GameHeader from "@/components/BirdShooter/GameHeader";
import MenuScreen from "@/components/BirdShooter/MenuScreen";

// Assets
import bgMusic from "@/assets/sounds/bg-music.mp3";
import shotSound from "@/assets/sounds/shot.mp3";
import gameOverSound from "@/assets/sounds/gameover.wav";
import countDownSound from "@/assets/sounds/countdown.wav";
import profile from "@/assets/images/Profile.jpg";
import logo from "@/assets/images/mtpro.png";

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
    () => parseInt(localStorage.getItem("birdShooterHighScore")) || 0,
  );
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [killedCount, setKilledCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({ logo: false, profile: false });

  const [playBg, { stop: stopBg, pause: pauseBg }] = useSound(bgMusic, {
    volume: 0.2,
    loop: true,
    interrupt: true,
  });
  const [playShot] = useSound(shotSound, { volume: 0.5, interrupt: true });
  const [playGameOver] = useSound(gameOverSound, { volume: 0.5 });
  const [playcountdown] = useSound(countDownSound, { volume: 0.5 });

  const formatTime = useCallback((secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    let interval;
    if (gameState === "playing" && !isPaused) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  useEffect(() => {
    if (gameState === "playing") {
      !isPaused ? playBg() : pauseBg();
    } else {
      stopBg();
    }
    return () => stopBg();
  }, [gameState, isPaused, playBg, pauseBg, stopBg]);

  const spawnBird = useCallback(
    (dynamicWords = null, dynamicIndex = null) => {
      const currentWords = dynamicWords || gameWords;
      const currentIndex = dynamicIndex !== null ? dynamicIndex : wordIndex;
      if (!currentWords?.length) return;
      const currentWord = currentWords[currentIndex % currentWords.length];
      const newBird = {
        id: Date.now() + Math.random(),
        text: currentWord,
        x: -20,
        y: Math.random() * 80 + 10,
        speed: (Math.random() * 0.15 + 0.1) * speedMultiplier,
        status: "flying",
        color: BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)],
        emoji: BIRD_EMOJIS[Math.floor(Math.random() * BIRD_EMOJIS.length)],
      };
      setBirds((prev) => [...prev, newBird]);
      setWordIndex((prev) => prev + 1);
    },
    [gameWords, wordIndex, speedMultiplier],
  );

  const startGame = (level) => {
    setBirds([]);
    setUserInput("");
    setWordIndex(0);
    setScore(0);
    setLives(7);
    setSpeedMultiplier(0.5);
    setSeconds(0);
    setKilledCount(0);
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
        spawnBird(shuffledWords, 0);
      }
    }, 800);
  };

  useEffect(() => {
    let gameLoop, spawnInterval;
    if (gameState === "playing" && !isPaused) {
      gameLoop = setInterval(() => {
        setBirds((prev) => {
          const updated = prev
            .map((bird) =>
              bird.status === "dying"
                ? { ...bird, y: bird.y + 4 }
                : { ...bird, x: bird.x + bird.speed },
            )
            .filter((bird) => bird.y < 120 && bird.x < 110);
          const missed = updated.find(
            (b) => b.x >= 105 && b.status === "flying",
          );
          if (missed) setLives((l) => Math.max(0, l - 1));
          return updated.filter((b) => b.x < 105);
        });
      }, 30);
      spawnInterval = setInterval(
        () => {
          spawnBird();
          setSpeedMultiplier((prev) => Math.min(prev + 0.004, 4));
        },
        Math.max(800, 2500 - speedMultiplier * 900),
      );
    }
    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover");
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
    score,
    highScore,
    spawnBird,
    playGameOver,
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
      setKilledCount((prev) => prev + 1);
      setUserInput("");
    }
  };

  const backToLevelSelect = () => {
    setGameState("menu");
    setBirds([]);
    setUserInput("");
  };
  const exitToAppHome = () => {
    stopBg();
    onBack();
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-0 overflow-hidden font-myanmar">
      <div className="w-full h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
        <AnimatePresence>
          {gameState === "playing" && (
            <GameHeader
              backToLevelSelect={backToLevelSelect}
              score={score}
              killedCount={killedCount}
              formatTime={formatTime}
              seconds={seconds}
              isPaused={isPaused}
              lives={lives}
              setShowRestartConfirm={setShowRestartConfirm}
              setIsPaused={setIsPaused}
            />
          )}
        </AnimatePresence>

        <div
          className={`flex-1 relative overflow-hidden bg-linear-to-b from-sky-400 to-sky-100 transition-all duration-500 ${gameState === "playing" && lives === 1 ? "ring-20 ring-inset ring-red-500/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.4)]" : ""}`}
        >
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
                  className={`text-9xl font-black ${countdown === "GO!" ? "text-yellow-400" : "text-white"} drop-shadow-2xl`}
                >
                  {countdown}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {gameState === "playing" &&
            birds.map((bird) => (
              <Bird key={bird.id} bird={bird} isPaused={isPaused} />
            ))}

          {gameState === "menu" && (
            <MenuScreen
              logo={logo}
              highScore={highScore}
              gameMode={gameMode}
              setGameMode={setGameMode}
              startGame={startGame}
              exitToAppHome={exitToAppHome}
              profile={profile}
              imgLoaded={imgLoaded}
              setImgLoaded={setImgLoaded}
              MenuButton={MenuButton}
            />
          )}

          <AnimatePresence>
            {showRestartConfirm && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-orange-400 max-w-sm w-full text-center relative overflow-hidden"
                >
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
                      className="py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(194,65,12)] active:translate-y-1 transition-all"
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
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-60 flex flex-col items-center justify-center p-2">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-blue-500 flex flex-col items-center gap-6 w-full max-w-lg"
              >
                <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-6 w-full justify-center">
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
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
                <div className="text-center w-full space-y-4">
                  <h2 className="text-4xl font-black text-red-600">
                    GAME OVER
                  </h2>
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-4xl border border-slate-100">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Total Score
                      </span>
                      <span className="text-3xl font-black text-slate-800">
                        {score}
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-l border-slate-200">
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
                    <p className="text-[12px] opacity-70 italic">
                      oakkarnyunt@gmail.com
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGameState("menu")}
                  className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(22,163,74)] transition-all active:translate-y-1"
                >
                  ပြန်လည်စတင်မည်
                </button>
              </motion.div>
            </div>
          )}

          {gameState === "playing" && isPaused && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-sky-400 flex flex-col items-center gap-6 w-full max-w-lg"
              >
                <div className="flex items-center gap-6 border-b-2 border-slate-100 pb-6 w-full justify-center">
                  <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-slate-800 text-left space-y-2">
                    <p className="text-2xl uppercase font-black tracking-widest text-blue-600">
                      MT PRO
                    </p>
                    <p className="text-[14px] font-black italic text-slate-500">
                      Computer Training Center
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
                  className="group relative flex items-center justify-center w-24 h-24 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all active:scale-90"
                >
                  <Play fill="currentColor" size={48} className="ml-2" />
                </button>
                <p className="text-green-600 font-black text-xl animate-pulse">
                  ဆက်ကစားမည်
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {gameState === "playing" && (
          <div className="p-10 bg-linear-to-t from-slate-50 to-white border-t-2 border-slate-100 flex justify-center items-center shadow-sm relative">
            <div className="relative w-full max-w-2xl group transition-all duration-300">
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
                className={`w-full pl-18 pr-8 py-6 rounded-[2.5rem] text-3xl text-center font-black tracking-wide transition-all duration-500 border-b-8 ${isPaused ? "bg-slate-100 border-slate-200 text-slate-300 opacity-60 cursor-not-allowed" : "bg-white border-sky-500 text-slate-800 shadow-xl focus:outline-none focus:border-sky-600 focus:scale-[1.02]"}`}
                style={{
                  fontFamily: "'Pyidaungsu', sans-serif",
                  lineHeight: "1.6",
                }}
                placeholder={
                  isPaused
                    ? "ဂိမ်းရပ်ထားပါသည်..."
                    : "စာလုံးကို မှန်အောင်ရိုက်ပါ..."
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
