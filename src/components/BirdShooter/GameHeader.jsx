import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Heart, RotateCcw, Play, Pause } from "lucide-react";

export default function GameHeader({
  backToLevelSelect,
  score,
  killedCount,
  formatTime,
  seconds,
  isPaused,
  lives,
  setShowRestartConfirm,
  setIsPaused,
}) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="px-8 py-4 bg-white/40 backdrop-blur-xl border-b border-white/20 flex justify-between items-center z-30 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setIsPaused(false); // Game ကို pause ဖြုတ်ပေးလိုက်ပါ
            backToLevelSelect();
          }}
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

        <div className="flex items-center gap-2 bg-white/90 p-1.5 pr-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-orange-500 p-2 rounded-xl shadow-inner">
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

      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="bg-slate-900 px-6 py-2 rounded-2xl shadow-md border-b-4 border-slate-700 flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${isPaused ? "bg-slate-500" : "bg-red-500"}`}
          />
          <span className="text-2xl font-mono font-black text-white tracking-widest">
            {formatTime(seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsPaused(false); // Game ကို pause ဖြုတ်ပေးလိုက်ပါ
              setShowRestartConfirm(true);
            }}
            // onClick={() => setShowRestartConfirm(true)

            // }
            className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all border border-orange-100"
          >
            <RotateCcw size={22} />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-3 rounded-xl shadow-md transition-all ${isPaused ? "bg-green-500 text-white animate-bounce" : "bg-white text-slate-600 border border-slate-100"}`}
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
  );
}
