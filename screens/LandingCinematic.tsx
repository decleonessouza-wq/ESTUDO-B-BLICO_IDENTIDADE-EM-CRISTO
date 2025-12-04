// screens/LandingCinematic.tsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";

const LandingCinematic: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // ⏳ Duração total da cinematic
    const timeout = setTimeout(() => {
      setVisible(false);
      navigateTo(Screen.Welcome);
      localStorage.setItem("cinematicViewed", "true");
    }, 3500); // 3.5 segundos

    return () => clearTimeout(timeout);
  }, [navigateTo]);

  const skip = () => {
    setVisible(false);
    localStorage.setItem("cinematicViewed", "true");
    navigateTo(Screen.Welcome);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden text-white z-[9999]">

      {/* 🌌 Fundo animado com partículas neon */}
      <div className="absolute inset-0">
        <div className="w-full h-full animate-gradient-move bg-[radial-gradient(circle_at_center,#1e1b4b,#111,#000)] opacity-70" />

        {/* 🔵 Partículas */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 opacity-40 blur-[2px] animate-pulse-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* ✨ Conteúdo principal */}
      <div className="relative z-10 text-center px-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-wide 
                       bg-clip-text text-transparent 
                       bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_#0ff] animate-pop">
          Identidade em Cristo
        </h1>

        <p className="mt-4 text-lg text-gray-300 animate-fade-in-delayed">
          Descubra quem você é aos olhos de Deus.
        </p>

        {/* Botão de Pular */}
        <button
          onClick={skip}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 
                     text-sm text-cyan-300 hover:text-cyan-100 
                     transition-colors"
        >
          Pular intro
        </button>
      </div>

      {/* ANIMAÇÕES TAILWIND PERSONALIZADAS */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1.2s ease-out forwards;
        }
        .animate-fade-in-delayed {
          animation: fadeIn 1.6s ease-out forwards;
        }

        @keyframes particleFloat {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px); opacity: 0.3; }
        }
        .animate-pulse-particle {
          animation: particleFloat infinite ease-in-out;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingCinematic;
