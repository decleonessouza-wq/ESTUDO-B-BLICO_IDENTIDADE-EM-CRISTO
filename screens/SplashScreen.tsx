// screens/SplashScreen.tsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";

const SplashScreen: React.FC = () => {
  const { navigateTo, userName } = useAppContext();

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const texts = [
    "A partir de agora você irá descobrir...",
    "Quem é você aos olhos de Deus!",
    "A sua verdadeira identidade.",
  ];

  // navegação automática
  useEffect(() => {
    const navigationTimer = setTimeout(() => {
      if (userName.trim()) {
        navigateTo(Screen.Study);
      } else {
        navigateTo(Screen.Welcome);
      }
    }, 10000); // 10s

    const textAnimationTimer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 3000); // troca a frase a cada 3s

    return () => {
      clearTimeout(navigationTimer);
      clearInterval(textAnimationTimer);
    };
  }, [navigateTo, userName, texts.length]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
      {/* BACKGROUND FULLSCREEN */}
      <div className="absolute inset-0">
        <img
          src="https://i.postimg.cc/T3223pSy/Identidade_logo_app.png"
          alt="Identidade em Cristo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* EFEITO DE LUZES SUAVES */}
      <div className="pointer-events-none absolute -top-20 -left-10 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />

      {/* CONTEÚDO CENTRAL */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 w-full max-w-xl space-y-6">
        {/* CARD COM IMAGEM + LOADER DENTRO */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[3/5] rounded-[2rem] bg-black/90 border border-cyan-400/60 shadow-[0_0_40px_rgba(34,211,238,0.6)] overflow-hidden flex items-center justify-center">
          {/* brilho no topo */}
          <div className="absolute inset-x-8 -top-10 h-24 bg-cyan-400/30 blur-3xl pointer-events-none" />

          {/* imagem central */}
          <img
            src="https://i.postimg.cc/T3223pSy/Identidade_logo_app.png"
            alt="Identidade em Cristo"
            className="relative z-0 w-[88%] h-auto object-contain"
          />

          {/* loader + Aguarde! DENTRO do card, na parte de baixo */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center">
            <div className="w-14 h-14 border-4 border-gray-300/70 border-t-sky-500 rounded-full animate-spin mb-3" />
            <h2 className="text-lg sm:text-xl font-bold tracking-wide">
              Aguarde!
            </h2>
          </div>
        </div>

        {/* TEXTOS ANIMADOS ABAIXO DO CARD */}
        <div className="w-full max-w-md text-center mt-2">
          <div className="relative h-20 sm:h-24 flex items-center justify-center overflow-hidden">
            {texts.map((text, index) => (
              <p
                key={index}
                className={`absolute transition-all duration-700 ease-in-out 
                  ${
                    currentTextIndex === index
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }
                  text-xl sm:text-2xl md:text-3xl font-semibold leading-tight px-4
                `}
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}
              >
                {text}
              </p>
            ))}
          </div>

          {/* pequena barra animada embaixo do texto */}
          <div className="mt-4 h-1 w-28 mx-auto bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
