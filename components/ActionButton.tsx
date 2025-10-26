import React, { ReactNode, CSSProperties } from 'react';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface ActionButtonProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  // FIX: Add the 'style' prop to allow passing inline styles for animations.
  style?: CSSProperties;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, className = '', disabled = false, type = 'button', style }) => {
  // CORREÇÃO: Substituindo a URL externa falha pela constante local SOUNDS.CLICK.id
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);

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
      style={style}
      className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;