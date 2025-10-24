import React, { ReactNode } from 'react';

interface AnimatedScreenProps {
  children: ReactNode;
}

const AnimatedScreen: React.FC<AnimatedScreenProps> = ({ children }) => {
  return (
    <div className="animate-fade-in w-full min-h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {children}
    </div>
  );
};

export default AnimatedScreen;