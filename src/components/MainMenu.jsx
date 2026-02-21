import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import logo from "@/assets/images/mtpro.png";
import profile from "@/assets/images/Profile.jpg";

export default function MainMenu({ onSelectGame }) {
  // Loading States
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const games = [
    {
      id: "bird-shooter",
      title: "Bird Shooter",
      desc: "စာရိုက်မြန်ဆန်ဖို့ ငှက်ကလေးတွေ ပစ်ကြမယ်",
      icon: "🐦",
      color: "from-sky-400 to-blue-600",
      difficulty: "All Levels",
    },
    {
      id: "falling-block",
      title: "Falling Blocks",
      desc: "အောက်ဆင်းလာတဲ့ စာလုံးတွေကို မှန်ကန်အောင် ရိုက်ထည့်ပြီး ကာကွယ်ပါ",
      icon: "📦",
      color: "from-purple-500 to-pink-500",
      difficulty: "All Levels",
    },
    {
      id: "mountain-climb",
      title: "Running Marathon",
      desc: "Computer AI ကို အမြန်နှုန်းနဲ့ ယှဉ်ပြိုင်ပါ",
      icon: "⛰️",
      color: "from-emerald-400 to-teal-600",
      difficulty: "Pro Typing",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Animated Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-600/10 rounded-full blur-[120px] animate-pulse"></div>

      {/* Header Section */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-10 z-10"
      >
        {/* Logo Section */}
        <div className="relative w-28 h-28 mb-4">
          {!logoLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse rounded-full border border-white/10" />
          )}
          <img
            src={logo}
            alt="MT PRO"
            onLoad={() => setLogoLoaded(true)}
            className={`w-28 h-28 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] rounded-full transition-all duration-700 ${
              logoLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter text-center">
          MT PRO{" "}
          <span className="text-sky-400 italic block md:inline">
            Computer Training Center
          </span>
        </h1>
        <div className="h-1 w-20 bg-sky-500 mt-2 rounded-full"></div>
      </motion.div>

      {/* Game Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full z-10">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="relative group cursor-pointer"
            onClick={() => onSelectGame(game.id)}
          >
            <div
              className={`absolute inset-0 bg-linear-to-br ${game.color} rounded-4xl blur-xl opacity-10 group-hover:opacity-30 transition-opacity`}
            ></div>
            <div className="relative bg-slate-800/40 backdrop-blur-xl border  p-6 rounded-4xl h-full flex flex-col border-b-4 border-black/20">
              <div className="flex justify-between items-start mb-4">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </span>
                <span className="bg-white/5 px-3 py-1 rounded-full text-[9px] font-black text-sky-400 border border-sky-500/20 uppercase tracking-widest">
                  {game.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                {game.title}
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                {game.desc}
              </p>
              <div className="mt-auto flex items-center text-sky-400 text-sm font-black gap-2 group-hover:gap-4 transition-all">
                <span>PLAY NOW</span>
                <Play size={16} fill="currentColor" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Developer Profile Section - Size ကို နဂိုအတိုင်း size-32 ပြန်ပြင်ထားသည် */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [-10, 10, -10],
          y: [-5, 5, -5],
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.8 },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
        className="mt-12 flex items-center gap-4 bg-white/5 p-3 pr-8 rounded-3xl border border-white/10 backdrop-blur-sm shadow-2xl"
      >
        <div className="relative size-32">
          {!profileLoaded && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl" />
          )}
          {/* Blue blur effect behind image */}
          <div className="absolute inset-0 bg-sky-500 rounded-xl blur-md opacity-30"></div>

          <motion.img
            src={profile}
            alt="Oakkar Nyunt"
            onLoad={() => setProfileLoaded(true)}
            className={`relative size-32 rounded-xl object-cover border border-white/20 transition-all duration-700 ${
              profileLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          />
        </div>

        <div className="text-left">
          <p className="text-[10px] uppercase font-black text-sky-400 tracking-[2px]">
            Lead Developer
          </p>
          <h3 className="text-lg font-black text-white">Oakkar Nyunt</h3>
          <p className="text-xs text-slate-300">oakkarnyunt@gmail.com</p>
        </div>
      </motion.div>
    </div>
  );
}
