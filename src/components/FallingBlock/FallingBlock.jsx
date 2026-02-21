import React, { useState, useEffect, useCallback, useRef } from "react";
import profile from "@/assets/images/Profile.jpg";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 700;

export default function FallingBlocks({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START");
  const [fallingWords, setFallingWords] = useState([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(7);
  const [language, setLanguage] = useState("english");
  const [diffLevel, setDiffLevel] = useState("EASY");

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const inputRef = useRef(null);
  const sounds = useRef({
    correct: new Audio("/sounds/crash.mp3"),
    gameOver: new Audio("/sounds/lose.mp3"),
  });

  useEffect(() => {
    let timer;
    if (gameState === "PLAY") {
      timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const spawnWord = useCallback(() => {
    if (!wordData || gameState !== "PLAY") return;
    const list = wordData[language]?.[diffLevel] || [];
    if (list.length === 0) return;

    const text = list[Math.floor(Math.random() * list.length)];
    const duration = diffLevel === "HARD" ? 9 : diffLevel === "MEDIUM" ? 6 : 8;

    const newWord = {
      id: `word-${Math.random()}`,
      text,
      x: Math.random() * (GAME_WIDTH - 150),
      duration: duration,
    };
    setFallingWords((prev) => [...prev, newWord]);
  }, [wordData, language, diffLevel, gameState]);

  const handleAnimationEnd = (id) => {
    setFallingWords((prev) => prev.filter((w) => w.id !== id));
    setLives((l) => {
      const newLife = Math.max(0, l - 1);
      if (newLife === 0) setGameState("GAMEOVER");
      return newLife;
    });
  };

  const handleInputChange = (e) => {
    if (gameState !== "PLAY") return;
    const currentInput = e.target.value;
    setTyped(currentInput);

    const matchIdx = fallingWords.findIndex(
      (w) => w.text === currentInput && !w.shattering,
    );

    if (matchIdx !== -1) {
      sounds.current.correct.currentTime = 0;
      sounds.current.correct.play().catch(() => {});

      setFallingWords((prev) =>
        prev.map((w, i) => (i === matchIdx ? { ...w, shattering: true } : w)),
      );

      setScore((s) => s + 10);
      setCorrectCount((prev) => prev + 1);
      setTyped("");
      if (inputRef.current) inputRef.current.value = "";

      setTimeout(() => {
        setFallingWords((prev) => prev.filter((w) => !w.shattering));
      }, 300);
    }
  };

  useEffect(() => {
    let spawner;
    if (gameState === "PLAY") {
      const spawnRate =
        diffLevel === "HARD" ? 5000 : diffLevel === "MEDIUM" ? 4000 : 3000;
      spawner = setInterval(spawnWord, spawnRate);
      if (inputRef.current) inputRef.current.focus();
    }
    return () => clearInterval(spawner);
  }, [gameState, spawnWord, diffLevel]);

  useEffect(() => {
    if (gameState === "GAMEOVER") {
      sounds.current.gameOver.play().catch(() => {});
    }
  }, [gameState]);

  useEffect(() => {
    fetch("./data/wordsForFallingBlock.json")
      .then((res) => res.json())
      .then(setWordData);
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-sans text-white select-none"
      onClick={() => inputRef.current?.focus()}
    >
      <style>{`
        @keyframes fall { from { transform: translateY(-50px); } to { transform: translateY(${GAME_HEIGHT}px); } }
        .falling-block { animation: fall linear forwards; will-change: transform; }
        .paused { animation-play-state: paused; }
        .shatter-effect { animation: shatter 0.3s ease-out forwards !important; pointer-events: none; }
        @keyframes shatter { 0% { transform: scale(1); opacity: 1; filter: blur(0); } 100% { transform: scale(1.5) rotate(15deg); opacity: 0; filter: blur(10px); } }
      `}</style>

      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onChange={handleInputChange}
        onBlur={() => gameState === "PLAY" && inputRef.current?.focus()}
        autoFocus
      />

      {/* Header HUD */}
      <div className="absolute top-6 z-50 flex items-center bg-zinc-900/90 border border-white/20 p-1 rounded-2xl backdrop-blur-xl shadow-2xl">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-l-xl transition-colors font-black text-xs"
        >
          BACK
        </button>
        <div className="flex items-center gap-6 px-8 h-12">
          <div className="w-16 text-center">
            <p className="text-[9px] text-emerald-400 font-bold uppercase opacity-60">
              Solved
            </p>
            <p className="text-base font-black leading-none">{correctCount}</p>
          </div>
          <div className="w-20 text-center border-x border-white/10">
            <p className="text-[9px] text-cyan-400 font-bold uppercase opacity-60">
              Score
            </p>
            <p className="text-base font-black leading-none">{score}</p>
          </div>
          <div className="w-16 text-center">
            <p className="text-[9px] text-rose-500 font-bold uppercase opacity-60">
              Lives
            </p>
            <p className="text-base font-black leading-none">{lives}</p>
          </div>
          <div className="w-20 text-center border-l border-white/10">
            <p className="text-[9px] text-amber-500 font-bold uppercase opacity-60">
              Timer
            </p>
            <p className="text-base font-black leading-none">
              {formatTime(timerSeconds)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGameState(gameState === "PLAY" ? "PAUSE" : "PLAY");
          }}
          className={`px-6 py-3 font-black text-xs rounded-r-xl transition-all ${gameState === "PLAY" ? "bg-amber-500 hover:bg-amber-400 text-zinc-950" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"}`}
        >
          {gameState === "PLAY" ? "PAUSE" : "RESUME"}
        </button>
      </div>

      <div
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        className="relative bg-zinc-900/50 border-x-2 border-b-2 border-zinc-800 rounded-b-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl"
      >
        {fallingWords.map((word) => (
          <div
            key={word.id}
            onAnimationEnd={() =>
              !word.shattering && handleAnimationEnd(word.id)
            }
            style={{
              left: `${word.x}px`,
              animationDuration: word.shattering ? "0s" : `${word.duration}s`,
              // UI မပျက်အောင် Fixed Width မထားဘဲ စာသားအလိုက် ကျယ်စေခြင်း
              minWidth: "100px",
              width: "max-content",
              borderRadius: "12px",
              background: "linear-gradient(145deg, #e2e8f0, #94a3b8)",
              willChange: "transform",
            }}
            className={`falling-block absolute px-6 py-3 shadow-xl flex items-center justify-center border-2 border-slate-400/50 
      ${gameState === "PAUSE" ? "paused" : ""} 
      ${word.shattering ? "shatter-effect" : ""}`}
          >
            <div className="grid">
              {/* စာသားရှည်ရင်လည်း UI မပျက်စေရန် white-space-nowrap သုံးထားသည် */}
              <span
                className="col-start-1 row-start-1 text-2xl font-black text-zinc-900 tracking-tight whitespace-nowrap"
                style={{ fontFamily: "Pyidaungsu, sans-serif" }}
              >
                {word.text}
              </span>

              {typed && word.text.startsWith(typed) && !word.shattering && (
                <span
                  className="col-start-1 row-start-1 text-2xl font-black text-blue-600 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-75"
                  style={{
                    fontFamily: "Pyidaungsu, sans-serif",
                    clipPath: `inset(0 ${100 - (typed.length / word.text.length) * 100}% 0 0)`,
                  }}
                >
                  {word.text}
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="absolute bottom-10 w-full text-center">
          <span className="text-2xl font-bold text-white opacity-80 tracking-widest">
            {typed || "TYPE..."}
          </span>
        </div>
      </div>

      {/* --- Modal Section --- */}
      {gameState !== "PLAY" && (
        <div className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center backdrop-blur-xl">
          <div className="text-center p-10 bg-zinc-900/80 border border-white/10 rounded-[3.5rem] shadow-2xl w-112.5">
            <div className="flex flex-col items-center mb-6">
              <img
                src={profile}
                className="w-24 h-24 rounded-full border-2 border-blue-500 mb-2 object-cover"
                alt="profile"
              />
              <h2 className="text-white font-black text-xl">Oakkar Nyunt</h2>
              <p className="text-blue-400 text-xs">oakkarnyunt@gmail.com</p>
            </div>

            <h1
              className={`text-5xl font-black mb-8 italic uppercase ${gameState === "GAMEOVER" ? "text-rose-500" : "text-blue-500"}`}
            >
              {gameState === "PAUSE"
                ? "Paused"
                : gameState === "GAMEOVER"
                  ? "Game Over"
                  : "Falling Block"}
            </h1>

            {/* Game Over Stats Display */}
            {gameState === "GAMEOVER" && (
              <div className="grid grid-cols-3 gap-4 mb-10 bg-black/30 p-6 rounded-3xl border border-white/5 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase opacity-70">
                    Final Score
                  </span>
                  <span className="text-2xl font-black text-white">
                    {score}
                  </span>
                </div>
                <div className="flex flex-col border-x border-white/10">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase opacity-70">
                    Total Solved
                  </span>
                  <span className="text-2xl font-black text-white">
                    {correctCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-bold uppercase opacity-70">
                    Total Time
                  </span>
                  <span className="text-2xl font-black text-white">
                    {formatTime(timerSeconds)}
                  </span>
                </div>
              </div>
            )}

            {gameState === "START" && (
              <div className="flex flex-col gap-6 mb-10 text-white">
                <div className="flex bg-zinc-800/50 p-1.5 rounded-2xl">
                  {["english", "myanmar"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${language === l ? "bg-blue-600 text-white" : "text-zinc-500"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {["EASY", "MEDIUM", "HARD"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDiffLevel(lvl)}
                      className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] ${diffLevel === lvl ? "border-blue-500 text-blue-400" : "border-zinc-700 text-zinc-600"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* --- Modal Section ထဲက Start Game ခလုတ်နေရာမှာ ဒီလိုပြင်လိုက်ပါ --- */}

              <button
                onClick={() => {
                  if (gameState === "START" || gameState === "GAMEOVER") {
                    setFallingWords([]);
                    setLives(7);
                    setScore(0);
                    setCorrectCount(0);
                    setTimerSeconds(0);
                    setTyped(""); // State ကို clear လုပ်ခြင်း

                    // Input text ကို အမှန်တကယ် clear ဖြစ်သွားအောင် ဤနေရာတွင် လုပ်ဆောင်ပါသည်
                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }
                  setGameState("PLAY");
                }}
                className="w-full py-5 bg-blue-600 rounded-3xl text-2xl font-black hover:bg-blue-500 transition-all uppercase"
              >
                {gameState === "PAUSE" ? "Continue" : "Start Game"}
              </button>
              <button
                onClick={onBack}
                className="text-zinc-500 font-bold uppercase text-xs mt-2 hover:text-rose-400"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
