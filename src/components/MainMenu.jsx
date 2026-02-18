import React from "react";
import { motion } from "framer-motion";
import { Play, ShieldCheck, User } from "lucide-react";
import logo from "@/assets/images/mtpro.png";
import profile from "@/assets/images/Profile.jpg";

export default function MainMenu({ onSelectGame }) {
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
      id: "mountain-climb",
      title: "Mountain Climb",
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
        className="flex flex-col items-center mb-16 z-10"
      >
        <img
          src={logo}
          alt="MT PRO"
          className="w-30 h-30 mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] rounded-full"
        />
        <h1 className="text-5xl font-black text-white tracking-tighter">
          MT PRO{" "}
          <span className="text-sky-400 italic">Computer Training Center</span>
        </h1>
        <div className="h-1 w-24 bg-sky-500 mt-2 rounded-full"></div>
      </motion.div>

      {/* Game Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ x: index === 0 ? -100 : 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ y: -10 }}
            className="relative group cursor-pointer"
            onClick={() => onSelectGame(game.id)}
          >
            <div
              className={`absolute inset-0 bg-linear-to-br ${game.color} rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}
            ></div>
            <div className="relative bg-slate-800/50 backdrop-blur-xl border p-8 rounded-[2.5rem] h-full flex flex-col border-b-8 border-black/20">
              <div className="flex justify-between items-start mb-6">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </span>
                <span className="bg-white/5 px-4 py-1 rounded-full text-[10px] font-black text-sky-400 border border-sky-500/30 uppercase tracking-widest">
                  {game.difficulty}
                </span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2">
                {game.title}
              </h2>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                {game.desc}
              </p>

              <div className="mt-auto flex items-center text-sky-400 font-black gap-2 group-hover:gap-4 transition-all">
                <span>PLAY NOW</span>
                <Play size={18} fill="currentColor" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Developer Profile Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [-20, 20, -20], // ဘယ်ဘက်နဲ့ ညာဘက်ကို ရွေ့ရန်
          y: [-10, 10, -10], // အပေါ်နဲ့ အောက်ကိုပါ တွဲရွေ့ရန် (ထောင့်ဖြတ် effect ရစေဖို့)
        }}
        transition={{
          opacity: { duration: 0.8, delay: 0.8 },
          x: {
            duration: 6, // ၆ စက္ကန့်ကြာမှ တစ်ပတ်ပြည့်မည် (အရမ်းငြိမ့်ညောင်းစေရန်)
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 4, // y-axis ကို duration မတူအောင် ထားခြင်းဖြင့် ပိုပြီး သဘာဝကျကျ လွင့်နေပါမယ်
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="mt-15 flex items-center gap-6 bg-white/5 p-4 pr-10 rounded-4xl border border-white/10 backdrop-blur-sm shadow-2xl"
      >
        {/* Profile Image with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-sky-500 rounded-2xl blur-md opacity-40"></div>
          <img
            src={profile}
            alt="Oakkar Nyunt"
            className="relative size-40 rounded-2xl object-cover border-2 border-white/20 shadow-2xl"
          />
        </div>

        {/* Text Info */}
        <div className="text-left">
          <p className="text-[10px] uppercase font-black text-sky-400 tracking-[3px] mb-1">
            Lead Developer
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Oakkar Nyunt
          </h3>

          <div className="flex gap-2 mt-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <p className="text-[13px] text-slate-400 font-bold">
              oakkarnyunt@gmail.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
