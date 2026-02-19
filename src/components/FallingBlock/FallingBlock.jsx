import React, { useState, useEffect, useCallback, useRef } from "react";
import profile from "@/assets/images/Profile.jpg";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 700;

export default function FallingBlocks({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START");
  const [fallingWords, setFallingWords] = useState([]);
  const [typed, setTyped] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [language, setLanguage] = useState("english");
  const [diffLevel, setDiffLevel] = useState("EASY");

  const inputRef = useRef(null); // မြန်မာစာ မှန်ကန်ဖို့အတွက် input ref
  const sounds = useRef({
    type: new Audio("./sounds/typingsound.mp3"),
    gameOver: new Audio("./sounds/lose.wav"),
  });

  const spawnWord = useCallback(() => {
    if (!wordData || gameState !== "PLAY") return;
    const list = wordData[language]?.[diffLevel] || [];
    if (list.length === 0) return;

    const text = list[Math.floor(Math.random() * list.length)];
    const duration = diffLevel === "HARD" ? 4 : diffLevel === "MEDIUM" ? 6 : 8;

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

  // မြန်မာစာ ရိုက်ချက်များကို စစ်ဆေးသည့် Logic
  const handleInputChange = (e) => {
    if (gameState !== "PLAY") return;
    const currentInput = e.target.value;
    setTyped(currentInput);

    // စကားလုံး အပြည့်အစုံ ကိုက်ညီမှု ရှိမရှိ စစ်ဆေးခြင်း
    const matchIdx = fallingWords.findIndex((w) => w.text === currentInput);
    if (matchIdx !== -1) {
      sounds.current.type.currentTime = 0;
      sounds.current.type.play().catch(() => {});

      setFallingWords((prev) => prev.filter((_, i) => i !== matchIdx));
      setScore((s) => s + 10);
      setTyped("");
      if (inputRef.current) inputRef.current.value = ""; // မှန်သွားရင် input ကို ရှင်းပစ်မယ်
    } else {
      // ရိုက်နေတဲ့ စာလုံးက ကျနေတဲ့ block တွေထဲမှာ လုံးဝ မရှိတော့ရင် Reset လုပ်မယ်
      const potentialMatch = fallingWords.some((w) =>
        w.text.startsWith(currentInput),
      );
      if (!potentialMatch && currentInput.length > 0) {
        // မြန်မာစာအတွက် သဝေထိုး ကိစ္စကြောင့် နောက်ဆုံး တစ်လုံးကိုပဲ စစ်တာမျိုး မလုပ်ဘဲ
        // ပိုပြီး flexible ဖြစ်အောင် ထားပေးထားပါတယ်
      }
    }
  };

  useEffect(() => {
    let spawner;
    if (gameState === "PLAY") {
      spawner = setInterval(spawnWord, 2000);
      if (inputRef.current) inputRef.current.focus(); // Play လုပ်တာနဲ့ Input ကို focus ပေးမယ်
    }
    return () => clearInterval(spawner);
  }, [gameState, spawnWord]);

  useEffect(() => {
    fetch("./data/wordsForFallingBlock.json")
      .then((res) => res.json())
      .then(setWordData);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center font-sans text-white select-none"
      onClick={() => inputRef.current?.focus()}
    >
      <style>{`
        @keyframes fall {
          from { transform: translateY(-50px); }
          to { transform: translateY(${GAME_HEIGHT}px); }
        }
        .falling-block {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          will-change: transform;
        }
        .paused { animation-play-state: paused; }

        @keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out forwards;
}
      `}</style>

      {/* Hidden Input for handling Myanmar Unicode properly */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onChange={handleInputChange}
        onBlur={() => gameState === "PLAY" && inputRef.current?.focus()}
        autoFocus
      />

      {/* Header HUD */}
      <div className="absolute top-8 flex items-center gap-12 text-2xl font-black z-50">
        <div className="text-cyan-400">SCORE: {score}</div>
        <div className="text-rose-500">LIVES: {"❤️".repeat(lives)}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGameState(gameState === "PLAY" ? "PAUSE" : "PLAY");
          }}
          className="bg-blue-600/20 border border-blue-500/30 px-4 py-1 rounded-xl text-xs font-black text-blue-400 hover:bg-blue-600 hover:text-white"
        >
          {gameState === "PLAY" ? "PAUSE" : "RESUME"}
        </button>
      </div>

      {/* Game Stage Area */}
      <div
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        className="relative bg-zinc-900/50 border-x-2 border-b-2 border-zinc-800 rounded-b-[2.5rem] overflow-hidden backdrop-blur-sm"
      >
        {fallingWords.map((word) => (
          <div
            key={word.id}
            onAnimationEnd={() => handleAnimationEnd(word.id)}
            style={{
              left: `${word.x}px`,
              animationDuration: `${word.duration}s`,
            }}
            className={`falling-block absolute px-5 py-2 bg-white rounded-2xl shadow-xl flex items-center justify-center ${gameState === "PAUSE" ? "paused" : ""}`}
          >
            <span
              className="text-2xl font-black text-zinc-900 tracking-tight"
              style={{ fontFamily: "Pyidaungsu, sans-serif" }}
            >
              {word.text}
              {/* Highlight logic: မြန်မာစာအတွက် split မလုပ်ဘဲ input ထဲမှာ ပါသလားပဲ စစ်ပါမယ် */}
              {typed && word.text.startsWith(typed) && (
                <span className="absolute inset-0 px-5 py-2 text-blue-600 overflow-hidden whitespace-nowrap">
                  {typed}
                </span>
              )}
            </span>
          </div>
        ))}

        <div className="absolute bottom-10 w-full text-center">
          <span className="text-4xl font-black text-white/10 tracking-widest">
            {typed || "TYPE..."}
          </span>
        </div>
      </div>

      {/* Modals */}
      {gameState !== "PLAY" && (
        <div className="fixed inset-0 bg-black/95 z-100 flex items-center justify-center backdrop-blur-xl transition-all duration-500">
          <div className="relative group text-center p-10 bg-zinc-900/80 border border-white/10 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-112.5 overflow-hidden">
            {/* Background Decor Animation (လှလှလေးဖြစ်အောင်) */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>

            {/* --- Profile Section --- */}
            <div className="relative mb-8 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full p-1 bg-linear-to-tr from-blue-600 to-cyan-400 shadow-lg mb-4 animate-bounce-slow">
                {/* Image နေရာမှာ ဆရာကြီးရဲ့ ပုံ link ထည့်ပါ */}
                <img
                  src={profile}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-zinc-900"
                />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Oakkar Nyunt
              </h2>
              <p className="text-blue-400 text-xs font-medium opacity-80">
                oakkarnyunt@gmail.com
              </p>
            </div>
            {/* ----------------------- */}

            <h1 className="text-5xl font-black mb-8 italic text-blue-500 uppercase tracking-tighter drop-shadow-lg">
              {gameState === "PAUSE"
                ? "Paused"
                : gameState === "GAMEOVER"
                  ? "Defeated"
                  : "Falling Block"}
            </h1>

            {gameState === "START" && (
              <div className="flex flex-col gap-6 mb-10 text-white animate-fade-in">
                <div className="flex bg-zinc-800/50 p-1.5 rounded-2xl border border-white/5">
                  {["english", "myanmar"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`flex-1 py-2.5 rounded-xl font-bold capitalize transition-all duration-300 ${language === l ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-500 hover:text-zinc-300"}`}
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
                      className={`flex-1 py-2 rounded-xl border-2 font-black text-[10px] transition-all duration-300 ${diffLevel === lvl ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-zinc-700 text-zinc-600 hover:border-zinc-500"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 relative z-10">
              <button
                onClick={() => {
                  if (gameState === "START" || gameState === "GAMEOVER") {
                    setFallingWords([]);
                    setLives(5);
                    setScore(0);
                    setTyped("");
                    if (inputRef.current) inputRef.current.value = "";
                  }
                  setGameState("PLAY");
                }}
                className="w-full py-5 bg-blue-600 rounded-3xl text-2xl font-black hover:bg-blue-500 shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all uppercase"
              >
                {gameState === "PAUSE" ? "Continue" : "Start Game"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="text-zinc-500 font-bold uppercase text-xs tracking-[0.2em] mt-2 hover:text-zinc-300 transition-colors"
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
