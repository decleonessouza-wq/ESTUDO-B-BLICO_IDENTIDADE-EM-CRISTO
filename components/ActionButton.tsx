import React, { ReactNode } from 'react';
import { useSound } from '../hooks/useSound';

interface ActionButtonProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, className = '', disabled = false, type = 'button' }) => {
  const playClickSound = useSound('https://www.soundjay.com/buttons/sounds/button-21.mp3', 0.3);

  const handleClick = () => {
    if (!disabled) {
      playClickSound();
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;