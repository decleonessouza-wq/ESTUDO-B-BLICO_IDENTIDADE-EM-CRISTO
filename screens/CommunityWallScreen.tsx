
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

const CommunityWallScreen: React.FC = () => {
  const { userName, posts, addPost, toggleLike, navigateTo, addComment, loadingPosts } = useAppContext();
  const [newPost, setNewPost] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const playPostSound = useSound(SOUNDS.NEW_POST.id, 0.5);
  const playLikeSound = useSound(SOUNDS.LIKE.id, 0.5);
  const playCommentSound = useSound(SOUNDS.NEW_POST.id, 0.4);
  const playToggleSound = useSound(SOUNDS.TOGGLE.id, 0.4);
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);

  useEffect(() => {
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [posts, filter, sortBy, expandedPostId]); // Re-render icons when state changes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      addPost(newPost.trim());
      setNewPost('');
      playPostSound();
    }
  };

  const handleLike = (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post && !post.isUserPost) {
      playLikeSound();
      toggleLike(id);
    }
  };
  
  const handleToggleComments = (postId: number) => {
    playToggleSound();
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      setCommentInput('');
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim() && expandedPostId) {
      addComment(expandedPostId, commentInput.trim());
      setCommentInput('');
      playCommentSound();
    }
  };

  const getInitials = (name: string) => {
      const names = name.split(' ');
      if (names.length > 1 && names[names.length - 1]) {
          return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
  }
  
  const displayedPosts = useMemo(() => {
    let filteredPosts = posts;

    if (filter === 'mine') {
      filteredPosts = posts.filter(post => post.isUserPost);
    }

    const sortedPosts = [...filteredPosts].sort((a, b) => {
      if (sortBy === 'popular') {
        return b.likes - a.likes;
      }
      // Default: 'recent'
      return b.id - a.id;
    });

    return sortedPosts;
  }, [posts, filter, sortBy]);

  const PillButton = ({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) => {
    const handleClick = () => {
        playClickSound();
        onClick();
    };
    return (
        <button
        onClick={handleClick}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${
            isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        >
        {label}
        </button>
    );
  };

  const LoadingSkeleton = () => (
    <div className="p-4 rounded-xl shadow-lg border bg-gray-800 border-gray-700 animate-pulse">
        <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-gray-700 mr-4 flex-shrink-0"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="flex items-center mt-3 space-x-6">
                    <div className="h-5 bg-gray-700 rounded w-10"></div>
                    <div className="h-5 bg-gray-700 rounded w-10"></div>
                </div>
            </div>
        </div>
    </div>
  );


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

        <div className="my-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-800 bg-opacity-50 p-3 rounded-xl border border-gray-700">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">Filtrar:</span>
                <PillButton label="Todos" isActive={filter === 'all'} onClick={() => setFilter('all')} />
                <PillButton label="Meus Posts" isActive={filter === 'mine'} onClick={() => setFilter('mine')} />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400">Ordenar:</span>
                <PillButton label="Mais Recentes" isActive={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
                <PillButton label="Mais Curtidos" isActive={sortBy === 'popular'} onClick={() => setSortBy('popular')} />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {loadingPosts && posts.length === 0 ? (
                Array.from({ length: 3 }).map((_, index) => <LoadingSkeleton key={index} />)
            ) : displayedPosts.length > 0 ? displayedPosts.map(post => (
                <div key={post.id} className={`p-4 rounded-xl shadow-lg border animate-fade-in transition-transform duration-300 hover:scale-[1.01] ${post.isUserPost ? 'bg-blue-900 bg-opacity-50 border-blue-700' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white mr-4 flex-shrink-0">
                            {getInitials(post.author)}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-blue-300">{post.author} {post.isUserPost && <span className="text-xs font-normal text-gray-400">(Você)</span>}</p>
                            <p className="text-gray-200 mt-1 whitespace-pre-wrap break-words">{post.message}</p>
                            <div className="flex items-center mt-3 space-x-6">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    disabled={post.isUserPost}
                                    className={`flex items-center gap-1.5 text-sm transition-colors transform hover:scale-110 ${post.isUserPost ? 'text-gray-500 cursor-not-allowed' : (post.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400')}`}
                                    aria-label="Curtir post"
                                >
                                    <i data-lucide="heart" className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`}></i>
                                    <span>{post.likes}</span>
                                </button>
                                <button
                                    onClick={() => handleToggleComments(post.id)}
                                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-cyan-400 transition-colors transform hover:scale-110"
                                    aria-label="Comentar no post"
                                >
                                    <i data-lucide="message-square" className="w-4 h-4"></i>
                                    <span>{post.comments.length}</span>
                                </button>
                            </div>

                            {expandedPostId === post.id && (
                                <div className="mt-4 space-y-3 animate-fade-in">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="flex items-start">
                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white text-xs mr-3 flex-shrink-0">
                                                {getInitials(comment.author)}
                                            </div>
                                            <div className="flex-1 bg-gray-700 p-2 rounded-lg">
                                                <p className="font-bold text-sm text-cyan-300">{comment.author}</p>
                                                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{comment.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
                                        <input 
                                          type="text"
                                          value={commentInput}
                                          onChange={(e) => setCommentInput(e.target.value)}
                                          placeholder="Adicione um comentário..."
                                          className="flex-1 bg-gray-600 border border-gray-500 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button type="submit" disabled={!commentInput.trim()} className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110">
                                            <i data-lucide="send-horizontal" className="w-5 h-5 text-white"></i>
                                        </button>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center py-16 text-gray-500 animate-fade-in">
                    <i data-lucide="message-square-off" className="w-16 h-16 mx-auto mb-4"></i>
                    <h3 className="text-xl font-semibold">{filter === 'mine' ? 'Nenhuma publicação sua' : 'Nenhuma publicação encontrada'}</h3>
                    <p className="mt-2">{filter === 'mine' ? 'Você ainda não publicou nada. Compartilhe sua primeira reflexão!' : 'Parece que não há publicações que correspondam aos seus filtros.'}</p>
                </div>
            )}
        </div>

        <div className="mt-6 text-center">
            <ActionButton onClick={() => navigateTo(Screen.Final)} className="bg-gradient-to-r from-gray-600 to-gray-800 focus:ring-gray-400">
                <i data-lucide="arrow-left" className="inline-block mr-2 w-5 h-5"></i>
                Voltar à Tela Final
            </ActionButton>
        </div>

      </div>
    </AnimatedScreen>
  );
};

export default CommunityWallScreen;