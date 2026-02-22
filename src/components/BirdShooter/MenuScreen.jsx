import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function MenuScreen({
  logo,
  highScore,
  gameMode,
  setGameMode,
  startGame,
  exitToAppHome,
  profile,
  imgLoaded,
  setImgLoaded,
  MenuButton,
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-50 p-6">
      <div className="absolute top-8 left-8 flex items-center gap-4 bg-white/10 p-3 pr-6 rounded-full backdrop-blur-md border border-white/20">
        <div className="w-25 h-25 bg-white rounded-full overflow-hidden border-2 border-sky-400 shadow-inner">
          <img
            src={logo}
            alt="Logo"
            onLoad={() => setImgLoaded((prev) => ({ ...prev, logo: true }))}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded.logo ? "opacity-100" : "opacity-0"}`}
            onError={(e) => (e.target.src = "🏢")}
          />
        </div>
        <div className="text-white text-left">
          <p className="text-xl uppercase font-bold tracking-widest text-blue-300">
            MT PRO
          </p>
          <p className="text-xs font-black italic">Computer Training Center</p>
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

      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="flex bg-white/10 p-2 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
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
        <button
          onClick={exitToAppHome}
          className="flex items-center gap-2 px-6 py-2 bg-slate-800/50 hover:bg-slate-700 text-white/80 rounded-full border border-white/10 transition-all text-sm font-bold uppercase tracking-widest active:scale-95"
        >
          <ArrowLeft size={16} /> Home Menu
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
            onLoad={() => setImgLoaded((prev) => ({ ...prev, profile: true }))}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded.profile ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}
