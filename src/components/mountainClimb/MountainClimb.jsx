import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mountain, Flag, User, Cpu, Trophy, ArrowLeft } from "lucide-react";

const CLIMB_WORDS = [
  "apple",
  "mountain",
  "climb",
  "speed",
  "focus",
  "typing",
  "success",
  "winner",
  "challenge",
  "energy",
];

export default function MountainClimb({ onBack }) {
  const [gameState, setGameState] = useState("select-difficulty");
  const [difficulty, setDifficulty] = useState(null);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [aiProgress, setAiProgress] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [winner, setWinner] = useState(null);

  const AI_SPEEDS = { easy: 0.3, medium: 0.8, hard: 1.5 };

  const startGame = (level) => {
    setDifficulty(level);
    setGameState("playing");
    setPlayerProgress(0);
    setAiProgress(0);
    setWinner(null);
    setCurrentWord(CLIMB_WORDS[Math.floor(Math.random() * CLIMB_WORDS.length)]);
    setUserInput("");
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setUserInput(val);
    if (val.trim() === currentWord) {
      const next = playerProgress + 10;
      setPlayerProgress(next);
      if (next >= 100) setWinner("player");
      else {
        setCurrentWord(
          CLIMB_WORDS[Math.floor(Math.random() * CLIMB_WORDS.length)],
        );
        setUserInput("");
      }
    }
  };

  useEffect(() => {
    let aiInterval;
    if (gameState === "playing" && !winner) {
      aiInterval = setInterval(() => {
        setAiProgress((prev) => {
          const next = prev + AI_SPEEDS[difficulty];
          if (next >= 100) {
            setWinner("ai");
            return 100;
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(aiInterval);
  }, [gameState, difficulty, winner]);

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col font-myanmar">
      <div className="p-4 flex items-center gap-4 bg-white border-b shadow-sm">
        <button
          onClick={onBack}
          className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-700 uppercase italic">
          Mountain Climber
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {gameState === "select-difficulty" ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center space-y-6"
          >
            <Mountain size={100} className="mx-auto text-sky-500 mb-4" />
            <h1 className="text-4xl font-black text-slate-800">
              အဆင့်ရွေးချယ်ပါ
            </h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => startGame("easy")}
                className="px-16 py-4 bg-green-500 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(21,128,61)] active:translate-y-1 transition-all"
              >
                EASY 🍀
              </button>
              <button
                onClick={() => startGame("medium")}
                className="px-16 py-4 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(194,65,12)] active:translate-y-1 transition-all"
              >
                MEDIUM 🔥
              </button>
              <button
                onClick={() => startGame("hard")}
                className="px-16 py-4 bg-red-600 text-white rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(153,27,27)] active:translate-y-1 transition-all"
              >
                HARD 💀
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-2xl space-y-10">
            {/* Race Track */}
            <div className="relative h-72 bg-white rounded-[2.5rem] border-4 border-slate-200 p-8 flex justify-around items-end shadow-inner overflow-hidden">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ y: -(playerProgress * 1.8) }}
                  className="bg-blue-500 p-4 rounded-full text-white shadow-xl"
                >
                  <User size={32} />
                </motion.div>
                <p className="font-black text-xs text-blue-500">YOU</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  animate={{ y: -(aiProgress * 1.8) }}
                  className="bg-red-500 p-4 rounded-full text-white shadow-xl"
                >
                  <Cpu size={32} />
                </motion.div>
                <p className="font-black text-xs text-red-500">AI</p>
              </div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <Flag
                  className="text-yellow-500 animate-bounce"
                  size={40}
                  fill="currentColor"
                />
                <div className="w-32 h-1 border-t-4 border-dashed border-slate-200"></div>
              </div>
            </div>

            {!winner ? (
              <div className="text-center space-y-6">
                <div className="text-5xl font-black bg-white px-12 py-5 rounded-3xl border-4 border-sky-400 shadow-lg text-slate-700">
                  {currentWord}
                </div>
                <input
                  autoFocus
                  type="text"
                  value={userInput}
                  onChange={handleInput}
                  className="w-full p-6 rounded-[2rem] text-3xl text-center border-4 border-slate-100 focus:border-sky-500 outline-none shadow-2xl transition-all"
                  placeholder="ဒီမှာ စာရိုက်ပါ..."
                />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center space-y-6 bg-white p-12 rounded-[3rem] shadow-2xl border-b-8 border-slate-200"
              >
                <div className="text-7xl mb-4">
                  {winner === "player" ? "🏆" : "🐌"}
                </div>
                <h3 className="text-4xl font-black text-slate-800">
                  {winner === "player" ? "အောင်မြင်ပါသည်!" : "ရှုံးသွားပါပြီ!"}
                </h3>
                <button
                  onClick={() => setGameState("select-difficulty")}
                  className="w-full py-5 bg-sky-500 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-sky-600 transition-all"
                >
                  ထပ်ကစားမယ်
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
