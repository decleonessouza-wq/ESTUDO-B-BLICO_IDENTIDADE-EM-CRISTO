import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';

const SplashScreen: React.FC = () => {
  const { navigateTo, userName } = useAppContext();

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const texts = [
    "A partir de agora você irá descobrir...",
    "Quem é você aos olhos de Deus!",
    "A sua verdadeira identidade.",
  ];

  useEffect(() => {
    const navigationTimer = setTimeout(() => {
      if (userName.trim()) {
        navigateTo(Screen.Study);
      } else {
        navigateTo(Screen.Welcome);
      }
    }, 10000); // 10 seconds total

    const textAnimationTimer = setInterval(() => {
      setCurrentTextIndex(prevIndex => (prevIndex + 1));
    }, 3000); // Change text every 3 seconds

    return () => {
      clearTimeout(navigationTimer);
      clearInterval(textAnimationTimer);
    };
  }, [navigateTo, userName]);

  return (
    <div 
      className="w-full h-screen bg-cover bg-center flex flex-col items-center justify-around text-white p-8"
      style={{ backgroundImage: "url('https://i.postimg.cc/QCnfyRvY/IDENTIDADE-20251025-103621-0000.png')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Loading Section */}
      <div className="z-10 text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-3xl font-bold">Aguarde!</h2>
      </div>
      
      {/* Suspense Text Section */}
      <div className="z-10 text-center animate-fade-in w-full max-w-3xl">
        <div className="relative h-24 flex items-center justify-center">
          {texts.map((text, index) => (
            <p
              key={index}
              className={`absolute transition-all duration-1000 ease-in-out text-3xl md:text-4xl font-semibold text-center px-4 ${
                currentTextIndex === index ? 'opacity-100 transform-none' : 'opacity-0 -translate-y-4'
              }`}
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
            >
              {text}
            </p>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SplashScreen;