import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { AVATAR_OPTIONS } from '../constants';
import ActionButton from './ActionButton';
import { useSound } from '../hooks/useSound';
import { Avatar } from '../types';

interface AvatarPickerModalProps {
  onClose: () => void;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ onClose }) => {
  const { setAvatar, userName, avatar } = useAppContext();
  const [selectedIcon, setSelectedIcon] = useState(avatar?.icon ?? AVATAR_OPTIONS.icons[0]);
  const [selectedColor, setSelectedColor] = useState(avatar?.color ?? AVATAR_OPTIONS.colors[0]);

  const playSelectSound = useSound('https://cdn.pixabay.com/audio/2022/03/15/audio_2c28b6b907.mp3', 0.4);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [selectedIcon, selectedColor]);

  const handleSave = () => {
    const newAvatar: Avatar = { icon: selectedIcon, color: selectedColor };
    setAvatar(newAvatar);
    playSelectSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full text-white border border-blue-700">
        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-300">Escolha seu Avatar!</h2>
        <p className="text-center text-gray-300 mb-6">Personalize como você aparece no Mural da Comunidade.</p>

        <div className="flex flex-col items-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${selectedColor} mb-4 transition-colors duration-300`}>
                <i data-lucide={selectedIcon.toLowerCase()} className="w-16 h-16 text-white"></i>
            </div>
            <p className="text-xl font-bold">{userName}</p>
        </div>
        
        <div className="mb-6">
            <h3 className="font-semibold mb-3 text-lg text-left">Ícone:</h3>
            <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.icons.map(icon => (
                    <button 
                        key={icon}
                        onClick={() => {setSelectedIcon(icon); playSelectSound();}}
                        className={`p-3 rounded-lg transition-all duration-200 ${selectedIcon === icon ? 'bg-blue-600 ring-4 ring-blue-400' : 'bg-gray-700 hover:bg-blue-800'}`}
                    >
                        <i data-lucide={icon.toLowerCase()} className="w-full h-full"></i>
                    </button>
                ))}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="font-semibold mb-3 text-lg text-left">Cor:</h3>
            <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.colors.map(color => (
                    <button 
                        key={color}
                        onClick={() => {setSelectedColor(color); playSelectSound();}}
                        className={`h-12 rounded-lg transition-all duration-200 ${color} ${selectedColor === color ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                    ></button>
                ))}
            </div>
        </div>
        
        <ActionButton onClick={handleSave} className="w-full">
            Salvar e Continuar
        </ActionButton>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
