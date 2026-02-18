import React, { useState } from "react";
import MainMenu from "@/components/MainMenu";
import BirdShooter from "@/components/BirdShooter/BirdShooter"; // နဂိုရှိပြီးသား ငှက်ပစ်ဂိမ်း
import MountainClimb from "@/components/MountainClimb/MountainClimb";

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
        <MountainClimb onBack={() => setCurrentGame("menu")} />
      )}
    </div>
  );
}
