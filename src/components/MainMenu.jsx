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
      id: "falling-block",
      title: "Falling Blocks",
      desc: "အောက်ဆင်းလာတဲ့ စာလုံးတွေကို အမှန်တကယ် ရိုက်ထည့်ပြီး ကာကွယ်ပါ",
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
        className="flex flex-col items-center mb-10 z-10" // margin bottom ကို နည်းနည်းလျှော့ထားတယ်
      >
        <img
          src={logo}
          alt="MT PRO"
          className="w-24 h-24 mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)] rounded-full"
        />
        <h1 className="text-4xl font-black text-white tracking-tighter text-center">
          MT PRO{" "}
          <span className="text-sky-400 italic block md:inline">
            Computer Training Center
          </span>
        </h1>
        <div className="h-1 w-20 bg-sky-500 mt-2 rounded-full"></div>
      </motion.div>

      {/* Game Selection Cards - အခု ၃ ခု ဘေးချင်းယှဉ်ဖြစ်သွားပါပြီ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full z-10">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ y: 50, opacity: 0 }} // အောက်ကနေ အပေါ်ကို တက်လာတဲ့ effect ပြောင်းထားတယ်
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="relative group cursor-pointer"
            onClick={() => onSelectGame(game.id)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${game.color} rounded-[2rem] blur-xl opacity-10 group-hover:opacity-30 transition-opacity`}
            ></div>

            {/* Card Size ကို ကျစ်ကျစ်လျစ်လျစ် ဖြစ်အောင် p-6 လုပ်ထားပါတယ် */}
            <div className="relative bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] h-full flex flex-col border-b-4 border-black/20">
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

      {/* Developer Profile Section - UI နဲ့ မျှအောင် size နည်းနည်းလျှော့ထားတယ် */}
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
        <div className="relative">
          <div className="absolute inset-0 bg-sky-500 rounded-xl blur-md opacity-30"></div>
          <img
            src={profile}
            alt="Oakkar Nyunt"
            className="relative size-35 rounded-xl object-cover border border-white/20"
          />
        </div>

        <div className="text-left">
          <p className="text-[10px] uppercase font-black text-sky-400 tracking-[2px]">
            Lead Developer
          </p>
          <h3 className="text-lg font-black text-white">Oakkar Nyunt</h3>
          <p className="text-xs">oakkarnyunt@gmail.com</p>
        </div>
      </motion.div>
    </div>
  );
}
