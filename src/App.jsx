import React, { useState } from "react";
import MainMenu from "@/components/MainMenu";
import BirdShooter from "@/components/BirdShooter/BirdShooter"; // နဂိုရှိပြီးသား ငှက်ပစ်ဂိမ်း
import RunningMarathon from "@/components/RunningMarathon/SprintMarathon";
import FallingBlocks from "@/components/FallingBlock/FallingBlocksMain"; // FallingBlock ကို import လုပ်လိုက်ပါပြီ

export default function App() {
  const [currentGame, setCurrentGame] = useState("menu");

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden">
      {currentGame === "menu" && (
        <MainMenu onSelectGame={(id) => setCurrentGame(id)} />
      )}

      {currentGame === "bird-shooter" && (
        <BirdShooter onBack={() => setCurrentGame("menu")} />
      )}

      {currentGame === "mountain-climb" && (
        <RunningMarathon onBack={() => setCurrentGame("menu")} />
      )}
      {/* ၃။ Falling Blocks ဂိမ်း (အသစ်ထည့်သွင်းမှု) */}
      {currentGame === "falling-block" && (
        <FallingBlocks onBack={() => setCurrentGame("menu")} />
      )}
    </div>
  );
}
