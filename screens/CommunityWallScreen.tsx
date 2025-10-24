import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';

const CommunityWallScreen: React.FC = () => {
  const { userName, posts, addPost, toggleLike, navigateTo } = useAppContext();
  const [newPost, setNewPost] = useState('');
  const playPostSound = useSound('https://www.soundjay.com/communication/sounds/send_message.mp3', 0.5);
  const playLikeSound = useSound('https://www.soundjay.com/buttons/sounds/button-16.mp3', 0.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      addPost(newPost.trim());
      setNewPost('');
      playPostSound();
    }
  };

  const handleLike = (id: number) => {
    playLikeSound();
    toggleLike(id);
  }

  const getInitials = (name: string) => {
      const names = name.split(' ');
      if (names.length > 1 && names[names.length - 1]) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl h-full flex flex-col text-white p-4">
        <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Mural da Comunidade</h1>
            <p className="text-lg text-gray-300">Compartilhe uma benção ou reflexão com a comunidade!</p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 bg-opacity-70 p-4 rounded-xl border border-blue-700">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`No que você está pensando, ${userName}?`}
            className="w-full h-24 p-3 bg-gray-700 bg-opacity-50 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-300"
            maxLength={280}
          />
          <div className="flex justify-end items-center mt-3">
              <span className="text-sm text-gray-400 mr-4">{280 - newPost.length}</span>
              <ActionButton type="submit" disabled={!newPost.trim()}>
                Publicar
              </ActionButton>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {posts.map(post => (
                <div key={post.id} className={`p-4 rounded-xl shadow-lg border animate-fade-in ${post.isUserPost ? 'bg-blue-900 bg-opacity-50 border-blue-700' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white mr-4 flex-shrink-0">
                            {getInitials(post.author)}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-blue-300">{post.author} {post.isUserPost && <span className="text-xs font-normal text-gray-400">(Você)</span>}</p>
                            <p className="text-gray-200 mt-1">{post.message}</p>
                        </div>
                    </div>
                    <div className="flex justify-end items-center mt-3">
                        <button 
                            onClick={() => !post.isUserPost && handleLike(post.id)}
                            disabled={post.isUserPost}
                            className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'} disabled:cursor-not-allowed disabled:hover:text-gray-400`}
                            aria-label="Curtir"
                        >
                            <i data-lucide="heart" className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}></i>
                            <span>{post.likes}</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
        <div className="text-center mt-6">
            <ActionButton onClick={() => navigateTo(Screen.Final)}>
                Voltar
            </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default CommunityWallScreen;