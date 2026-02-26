import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import HUD from "@/components/RunningMarathon/HUD";
import Track from "@/components/RunningMarathon/Track";
import { AIRunner, PlayerRunner } from "@/components/RunningMarathon/Character";
import GameModals from "@/components/RunningMarathon/GameModals";

const LEVELS = {
  EASY: { aiSpeed: 1.2, dist: 30000, label: "EASY" },
  MEDIUM: { aiSpeed: 2.2, dist: 45000, label: "MEDIUM" },
  HARD: { aiSpeed: 3.2, dist: 55000, label: "HARD" },
  Pro: { aiSpeed: 4.2, dist: 45000, label: "VERY HARD" },
};

export default function SprintMarathon({ onBack }) {
  const [wordData, setWordData] = useState(null);
  const [gameState, setGameState] = useState("START");
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
  const sounds = useRef({ wrong: null, win: null, lose: null, bg: null });

  useEffect(() => {
    sounds.current.wrong = new Audio("/sounds/mistake.mp3");
    sounds.current.win = new Audio("/sounds/gamewin.mp3");
    sounds.current.lose = new Audio("/sounds/lose.mp3");
    sounds.current.bg = new Audio("/sounds/bg_music.mp3");
    Object.values(sounds.current).forEach((s) => {
      if (s) s.preload = "auto";
    });
    return () =>
      Object.values(sounds.current).forEach((s) => {
        if (s) {
          s.pause();
          s.src = "";
        }
      });
  }, []);

  useEffect(() => {
    const bg = sounds.current.bg;
    if (!bg) return;
    bg.loop = true;
    bg.volume = 0.8;
    if (gameState === "PLAY") bg.play().catch(() => {});
    else {
      bg.pause();
      if (gameState !== "PAUSE") bg.currentTime = 0;
    }
  }, [gameState]);

  useEffect(() => {
    fetch("./data/wordsForRunning.json")
      .then((res) => res.json())
      .then(setWordData);
  }, []);

  const getNextWord = useCallback(
    (lang, lvKey) => {
      if (!wordData?.[lang]?.[lvKey]) return "GO!";
      const list = wordData[lang][lvKey];
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
    setWord(getNextWord(selectedLang, lvKey.replace(" ", "_")));
    setGameState("PLAY");
  };

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

  useEffect(() => {
    if (gameState === "PLAY") {
      if (!isFinishing && playerX >= level.dist - 1000) setIsFinishing(true);
      if (playerX >= level.dist) {
        setGameState("WIN");
        sounds.current.win.currentTime = 0;
        sounds.current.win.play().catch(() => {});
      } else if (aiX >= level.dist && !isFinishing) {
        setGameState("LOSE");
        sounds.current.lose.currentTime = 0;
        sounds.current.lose.play().catch(() => {});
      }
      if (isFinishing) {
        const t = setTimeout(() => setPlayerX((p) => p + 25), 20);
        return () => clearTimeout(t);
      }
    }
  }, [playerX, aiX, level.dist, gameState, isFinishing]);

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
        } else {
          setIsError(true);
          setCombo(0);
          sounds.current.wrong.currentTime = 0;
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
      <HUD
        onBack={onBack}
        gameState={gameState}
        setGameState={setGameState}
        playerX={playerX}
        levelDist={level.dist}
        selectedLang={selectedLang}
        levelLabel={level.label}
      />

      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col justify-center">
        <Track gameState={gameState} playerX={playerX} levelDist={level.dist} />
        <AIRunner aiX={aiX} playerX={playerX} gameState={gameState} />
        <PlayerRunner
          gameState={gameState}
          isFinishing={isFinishing}
          word={word}
          typed={typed}
          isError={isError}
        />
      </div>

      <GameModals
        gameState={gameState}
        setGameState={setGameState}
        onBack={onBack}
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        levels={LEVELS}
        initRace={initRace}
      />
    </motion.div>
  );
}
