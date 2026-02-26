import React, { useState, useEffect, useCallback, useRef } from "react";
import HUD from "@/components/FallingBlock/HUD";
import FallingBlock from "@/components/FallingBlock/FallingBlocks";
import GameModal from "@/components/FallingBlock/GameModal";

const GAME_WIDTH = 900;
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

  // Timer Effect
  useEffect(() => {
    let timer;
    if (gameState === "PLAY") {
      timer = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  // Word Spawner
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
      duration,
    };
    setFallingWords((prev) => [...prev, newWord]);
  }, [wordData, language, diffLevel, gameState]);

  // Handle Game Logic
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
      setTimeout(
        () => setFallingWords((prev) => prev.filter((w) => !w.shattering)),
        300,
      );
    }
  };

  useEffect(() => {
    let spawner;
    if (gameState === "PLAY") {
      const spawnRate =
        diffLevel === "HARD" ? 5000 : diffLevel === "MEDIUM" ? 3600 : 2800;
      spawner = setInterval(spawnWord, spawnRate);
      inputRef.current?.focus();
    }
    return () => clearInterval(spawner);
  }, [gameState, spawnWord, diffLevel]);

  useEffect(() => {
    if (gameState === "GAMEOVER")
      sounds.current.gameOver.play().catch(() => {});
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

  const handleStart = () => {
    if (gameState === "START" || gameState === "GAMEOVER") {
      setFallingWords([]);
      setLives(10);
      setScore(0);
      setCorrectCount(0);
      setTimerSeconds(0);
      setTyped("");
      if (inputRef.current) inputRef.current.value = "";
    }
    setGameState("PLAY");
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

      <HUD
        onBack={onBack}
        correctCount={correctCount}
        score={score}
        lives={lives}
        timer={formatTime(timerSeconds)}
        gameState={gameState}
        setGameState={setGameState}
      />

      <div
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        className="relative bg-zinc-900/50 border-x-2 border-b-2 border-zinc-800 rounded-b-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl"
      >
        {fallingWords.map((word) => (
          <FallingBlock
            key={word.id}
            word={word}
            gameState={gameState}
            typed={typed}
            onAnimationEnd={handleAnimationEnd}
          />
        ))}
        <div className="absolute bottom-10 w-full text-center">
          <span className="text-2xl font-bold text-white opacity-80 tracking-widest">
            {typed || "TYPE..."}
          </span>
        </div>
      </div>

      <GameModal
        gameState={gameState}
        score={score}
        correctCount={correctCount}
        timer={formatTime(timerSeconds)}
        language={language}
        setLanguage={setLanguage}
        diffLevel={diffLevel}
        setDiffLevel={setDiffLevel}
        onStart={handleStart}
        onBack={onBack}
      />
    </div>
  );
}
