import React from "react";

export default function FallingBlock({
  word,
  gameState,
  typed,
  onAnimationEnd,
}) {
  return (
    <div
      onAnimationEnd={() => !word.shattering && onAnimationEnd(word.id)}
      style={{
        left: `${word.x}px`,
        animationDuration: word.shattering ? "0s" : `${word.duration}s`,
        minWidth: "100px",
        width: "max-content",
        borderRadius: "12px",
        background: "linear-gradient(145deg, #e2e8f0, #94a3b8)",
        willChange: "transform",
      }}
      className={`falling-block absolute px-6 py-3 shadow-xl flex items-center justify-center border-2 border-slate-400/50 
        ${gameState === "PAUSE" ? "paused" : ""} 
        ${word.shattering ? "shatter-effect" : ""}`}
    >
      <div className="grid">
        <span
          className="col-start-1 row-start-1 text-2xl font-black text-zinc-900 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "Pyidaungsu, sans-serif" }}
        >
          {word.text}
        </span>

        {typed && word.text.startsWith(typed) && !word.shattering && (
          <span
            className="col-start-1 row-start-1 text-2xl font-black text-blue-600 tracking-tight whitespace-nowrap overflow-hidden transition-all duration-75"
            style={{
              fontFamily: "Pyidaungsu, sans-serif",
              clipPath: `inset(0 ${100 - (typed.length / word.text.length) * 100}% 0 0)`,
            }}
          >
            {word.text}
          </span>
        )}
      </div>
    </div>
  );
}
