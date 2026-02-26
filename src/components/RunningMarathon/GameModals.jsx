import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Profile from "@/assets/images/Profile.jpg";

export default function GameModals({
  gameState,
  setGameState,
  onBack,
  selectedLang,
  setSelectedLang,
  levels,
  initRace,
}) {
  const profileError = (e) =>
    (e.target.src =
      "https://ui-avatars.com/api/?name=Dev&background=3b82f6&color=fff");

  return (
    <AnimatePresence>
      {gameState === "PAUSE" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-100 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] text-center max-w-sm w-full"
          >
            <h2 className="text-zinc-500 font-bold tracking-[0.3em] text-xs mb-6 uppercase">
              Game Paused
            </h2>
            <div className="bg-zinc-800/50 p-6 rounded-[2.5rem] border border-white/5 mb-8">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 mx-auto mb-4">
                <img
                  src={Profile}
                  alt="Dev"
                  className="w-full h-full object-cover"
                  onError={profileError}
                />
              </div>
              <h3 className="text-2xl font-black text-white mb-1">
                Oakkar Nyunt
              </h3>
              <p className="text-blue-400 text-sm mb-3">Lead Developer</p>
              <div className="text-zinc-400 text-xs font-mono bg-black/30 py-2 px-4 rounded-full">
                📧 oakkarnyunt@gmail.com
              </div>
            </div>
            <button
              onClick={() => setGameState("PLAY")}
              className="w-full py-4 bg-blue-600 rounded-2xl font-black text-lg shadow-lg"
            >
              RESUME RACE
            </button>
            <button
              onClick={onBack}
              className="mt-4 text-zinc-500 text-sm font-bold"
            >
              Quit Game
            </button>
          </motion.div>
        </motion.div>
      )}

      {["START", "LANG_SELECT", "LEVEL_SELECT", "WIN", "LOSE"].includes(
        gameState,
      ) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center"
        >
          <div className="bg-zinc-900 p-12 rounded-[3rem] text-center border border-white/10 w-full max-w-md">
            {gameState === "START" && (
              <>
                <h1 className="text-5xl font-black mb-10 text-blue-500 italic">
                  MARATHON
                </h1>
                <button
                  onClick={() => setGameState("LANG_SELECT")}
                  className="w-full py-5 bg-blue-600 rounded-2xl font-black text-xl"
                >
                  START RACE
                </button>
              </>
            )}
            {gameState === "LANG_SELECT" && (
              <>
                <h2 className="text-2xl font-bold mb-6">SELECT LANGUAGE</h2>
                <div className="grid gap-4">
                  {["ENGLISH", "MYANMAR"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setGameState("LEVEL_SELECT");
                      }}
                      className="p-5 bg-zinc-800 rounded-2xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      {lang === "MYANMAR" ? "မြန်မာစာ" : lang}
                    </button>
                  ))}
                </div>
              </>
            )}
            {gameState === "LEVEL_SELECT" && (
              <>
                <h2 className="text-2xl font-bold mb-6">SELECT DIFFICULTY</h2>
                <div className="grid gap-3">
                  {Object.keys(levels).map((k) => (
                    <button
                      key={k}
                      onClick={() => initRace(k)}
                      className="p-4 bg-zinc-800 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                    >
                      {k}
                    </button>
                  ))}
                  <button
                    onClick={() => setGameState("LANG_SELECT")}
                    className="mt-4 text-zinc-500 underline"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
            {(gameState === "WIN" || gameState === "LOSE") && (
              <div className="flex flex-col items-center">
                <h1
                  className={`text-6xl font-black mb-8 italic ${gameState === "WIN" ? "text-green-500" : "text-red-500"}`}
                >
                  {gameState}!
                </h1>
                <div className="bg-zinc-800/50 p-6 rounded-[2.5rem] border border-white/5 mb-8 w-full">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mx-auto bg-zinc-700">
                    <img
                      src={Profile}
                      alt="Dev"
                      className="w-full h-full object-cover"
                      onError={profileError}
                    />
                  </div>
                  <h3 className="text-xl font-black text-white mt-4 mb-1">
                    Oakkar Nyunt
                  </h3>
                  <p className="text-blue-400 text-xs font-medium mb-3">
                    Lead Developer
                  </p>
                  <div className="text-zinc-400 text-[12px] font-mono bg-black/30 py-2 px-4 rounded-full border border-white/5">
                    📧 oakkarnyunt@gmail.com
                  </div>
                </div>
                <button
                  onClick={() => setGameState("START")}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-lg"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={onBack}
                  className="mt-4 text-zinc-500 text-sm font-bold"
                >
                  Quit Game
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
