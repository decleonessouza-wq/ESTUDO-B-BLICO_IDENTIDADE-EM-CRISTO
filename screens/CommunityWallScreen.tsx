import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, StageProgress } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

const MAX_LEVEL = 5;
const XP_PER_LEVEL = 200; // mesmo conceito do PlayerStatusBar

// Emojis rápidos para o campo de postagem
const QUICK_EMOJIS = ['🙏', '❤️', '🔥', '😇', '✨'];

// Heurística simples para mostrar um “selo” com emoji no post
const getPostMoodEmoji = (message: string): string | null => {
  const text = message.toLowerCase();

  if (text.includes('jesus') || text.includes('cristo')) return '✝️';
  if (text.includes('amor') || text.includes('love')) return '❤️';
  if (text.includes('fogo') || text.includes('avivamento')) return '🔥';
  if (text.includes('alegria') || text.includes('feliz') || text.includes('gratid')) return '😄';
  if (text.includes('paz')) return '🕊️';
  if (text.includes('oração') || text.includes('orar')) return '🙏';

  return null;
};

const CommunityWallScreen: React.FC = () => {
  const {
    userName,
    posts,
    addPost,
    toggleLike,
    navigateTo,
    addComment,
    loadingPosts,
    // 🔹 dados da jornada para mostrar o resumo do jogador
    totalScore,
    stageProgress,
    stagesData,
    completedBonusGames,
    // 🔹 usado para voltar para a próxima etapa da jornada
    currentStageId,
    setCurrentStageId,
  } = useAppContext();

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

  // 🔹 estatísticas da jornada do usuário para o card de topo
  const journeyStats = useMemo(() => {
    const totalStagesLocal = stagesData?.length ?? 0;

    const completedStagesLocal = stageProgress
      ? Object.values(stageProgress).filter(
          (sp) => sp && (sp as StageProgress).completed
        ).length
      : 0;

    const completionPercentLocal =
      totalStagesLocal > 0
        ? Math.round((completedStagesLocal / totalStagesLocal) * 100)
        : 0;

    const score = totalScore ?? 0;
    const rawLevel = Math.floor(score / XP_PER_LEVEL) + 1;
    const levelLocal = Math.min(MAX_LEVEL, Math.max(1, rawLevel));

    const bonusCount = completedBonusGames?.length ?? 0;

    return {
      totalStages: totalStagesLocal,
      completedStages: completedStagesLocal,
      completionPercent: completionPercentLocal,
      level: levelLocal,
      bonusCount,
      score,
    };
  }, [stagesData, stageProgress, totalScore, completedBonusGames]);

  useEffect(() => {
    // Use um timeout para garantir que o React terminou o render antes do Lucide.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [posts, filter, sortBy, expandedPostId]); // Re-render icons quando estado mudar

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      addPost(newPost.trim());
      setNewPost('');
      playPostSound();
    }
  };

  const handleLike = (id: number) => {
    const post = posts.find((p) => p.id === id);
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

  const handleAddEmojiToPost = (emoji: string) => {
    setNewPost((prev) => (prev ? `${prev} ${emoji}` : emoji));
    playClickSound();
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayedPosts = useMemo(() => {
    let filteredPosts = posts;

    if (filter === 'mine') {
      filteredPosts = posts.filter((post) => post.isUserPost);
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

  const PillButton = ({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const handleClick = () => {
      playClickSound();
      onClick();
    };
    return (
      <button
        onClick={handleClick}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 transform hover:scale-105 ${
          isActive
            ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/30'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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

  const firstName = userName ? userName.split(' ')[0] : 'Participante';

  // 🔹 Detecta se TODAS as etapas da jornada estão concluídas
  const isJourneyCompleted = useMemo(() => {
    if (!stagesData || stagesData.length === 0) return false;

    const total = stagesData.length;
    const completed = stagesData.filter(
      (stage) => stageProgress[stage.id]?.completed
    ).length;

    return total > 0 && completed >= total;
  }, [stagesData, stageProgress]);

  // 🔁 Voltar para a próxima etapa ainda não concluída
  const goBackToJourneyNextStage = () => {
    if (!stagesData || stagesData.length === 0) {
      navigateTo(Screen.Study);
      return;
    }

    const sortedStages = [...stagesData].sort((a, b) => a.id - b.id);
    const currentIndex = sortedStages.findIndex(
      (s) => s.id === currentStageId
    );

    // 1. tenta achar próxima etapa não concluída depois da atual
    let nextStage =
      sortedStages.find(
        (stage, idx) =>
          idx > currentIndex && !stageProgress[stage.id]?.completed
      ) ||
      // 2. se não tiver depois, pega qualquer etapa não concluída
      sortedStages.find((stage) => !stageProgress[stage.id]?.completed);

    if (nextStage) {
      setCurrentStageId(nextStage.id);
    }

    navigateTo(Screen.Study);
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl h-full flex flex-col text-white p-4 mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-md">
            🌟 Mural da Comunidade 🌟
          </h1>
          <p className="text-lg text-gray-300">
            Compartilhe uma benção ou reflexão com a comunidade! 🙏
          </p>
        </div>

        {/* 🔹 Resumo gamificado da jornada do usuário */}
        <div className="mb-5 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-sky-900/70 border border-indigo-600/70 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-lg shadow-sky-900/30">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/50">
              {getInitials(firstName)}
            </div>
            <div>
              <p className="text-sm text-gray-300">
                Sua jornada,{' '}
                <span className="font-semibold text-sky-300">{firstName}</span>
              </p>
              <p className="text-xs text-gray-400">
                Nível{' '}
                <span className="font-semibold text-indigo-300">
                  {journeyStats.level}
                </span>{' '}
                • {journeyStats.completedStages}/{journeyStats.totalStages || '?'}{' '}
                etapas concluídas • {journeyStats.completionPercent}%
              </p>
              <p className="text-xs text-emerald-300">
                Pontos: {journeyStats.score} • Jogos bônus concluídos:{' '}
                {journeyStats.bonusCount}
              </p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${journeyStats.completionPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400 text-right">
              Sua caminhada inspira outros a postarem aqui 💬
            </p>
          </div>
        </div>

        {/* Caixa de novo post */}
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-slate-900/80 p-4 rounded-2xl border border-sky-700/70 shadow-lg shadow-sky-900/40 backdrop-blur"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sky-300 font-semibold flex items-center gap-1">
              ✍️ Compartilhe sua reflexão
            </span>
            <span className="text-xs text-gray-400">
              {280 - newPost.length} caracteres restantes
            </span>
          </div>

          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={
              userName
                ? `Compartilhe algo que Deus falou com você hoje, ${firstName}...`
                : 'Compartilhe algo que Deus falou com você hoje...'
            }
            className="w-full h-24 p-3 bg-slate-800/80 border-2 border-sky-500/70 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-sky-400/60 focus:border-transparent transition duration-300 shadow-inner"
            maxLength={280}
          />

          {/* Linha de emojis rápidos */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-xl">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddEmojiToPost(emoji)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-sky-600/70 hover:scale-110 transition-all duration-150 shadow"
                  aria-label={`Inserir ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-gray-400">
                {journeyStats.completionPercent === 100
                  ? 'Você concluiu a jornada! Use o mural para encorajar outros. 🙌'
                  : 'Use o mural para encorajar outros na mesma jornada que você.'}
              </span>
              <ActionButton type="submit" disabled={!newPost.trim()}>
                Publicar ✨
              </ActionButton>
            </div>
          </div>
        </form>

        {/* Filtros e ordenação */}
        <div className="my-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-700 shadow-md shadow-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
              🔎 Filtrar:
            </span>
            <PillButton
              label="Todos"
              isActive={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <PillButton
              label="Meus Posts"
              isActive={filter === 'mine'}
              onClick={() => setFilter('mine')}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300 flex items-center gap-1">
              📌 Ordenar:
            </span>
            <PillButton
              label="Mais Recentes"
              isActive={sortBy === 'recent'}
              onClick={() => setSortBy('recent')}
            />
            <PillButton
              label="Mais Curtidos"
              isActive={sortBy === 'popular'}
              onClick={() => setSortBy('popular')}
            />
          </div>
        </div>

        {/* Lista de posts */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loadingPosts && posts.length === 0 ? (
            Array.from({ length: 3 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))
          ) : displayedPosts.length > 0 ? (
            displayedPosts.map((post, index) => {
              const isUserPost = post.isUserPost;
              const showJourneyBadge =
                isUserPost && journeyStats.completionPercent === 100;
              const moodEmoji = getPostMoodEmoji(post.message);

              const commonClasses =
                'p-4 rounded-xl shadow-lg border animate-fade-in transition-transform duration-300 hover:scale-[1.01]';

              const bgClasses = isUserPost
                ? 'bg-gradient-to-r from-indigo-900/80 via-sky-900/70 to-slate-900/80 border-indigo-500/70 shadow-sky-900/50'
                : index % 2 === 0
                ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-sky-900/70 border-slate-700 shadow-slate-900/50'
                : 'bg-gradient-to-r from-slate-900/90 via-emerald-900/60 to-slate-900/80 border-emerald-500/40 shadow-emerald-900/40';

              return (
                <div key={post.id} className={`${commonClasses} ${bgClasses}`}>
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-white mr-4 flex-shrink-0 shadow-md shadow-sky-500/40">
                      {getInitials(post.author)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sky-300 flex items-center gap-1">
                          {post.author}{' '}
                          {moodEmoji && (
                            <span className="text-base align-middle">
                              {moodEmoji}
                            </span>
                          )}
                          {isUserPost && (
                            <span className="text-xs font-normal text-gray-300">
                              (Você)
                            </span>
                          )}
                        </p>
                        {showJourneyBadge && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-400/60 text-emerald-300">
                            <i data-lucide="sparkles" className="w-3 h-3" />
                            Concluiu a Jornada
                          </span>
                        )}
                      </div>

                      <p className="text-gray-100 mt-1 whitespace-pre-wrap break-words">
                        {post.message}
                      </p>

                      <div className="flex items-center mt-3 space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          disabled={post.isUserPost}
                          className={`flex items-center gap-1.5 text-sm transition-colors transform hover:scale-110 ${
                            post.isUserPost
                              ? 'text-gray-500 cursor-not-allowed'
                              : post.isLiked
                              ? 'text-pink-400'
                              : 'text-gray-300 hover:text-pink-300'
                          }`}
                          aria-label="Curtir post"
                        >
                          <i
                            data-lucide="heart"
                            className={`w-4 h-4 ${
                              post.isLiked ? 'fill-current' : ''
                            }`}
                          ></i>
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-cyan-300 transition-colors transform hover:scale-110"
                          aria-label="Comentar no post"
                        >
                          <i
                            data-lucide="message-square"
                            className="w-4 h-4"
                          ></i>
                          <span>{post.comments.length}</span>
                        </button>
                      </div>

                      {expandedPostId === post.id && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs mr-3 flex-shrink-0">
                                {getInitials(comment.author)}
                              </div>
                              <div className="flex-1 bg-slate-800/90 p-2 rounded-lg border border-slate-700">
                                <p className="font-bold text-sm text-cyan-300">
                                  {comment.author}
                                </p>
                                <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                                  {comment.message}
                                </p>
                              </div>
                            </div>
                          ))}
                          <form
                            onSubmit={handleCommentSubmit}
                            className="flex items-center gap-2 pt-2"
                          >
                            <input
                              type="text"
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              placeholder="Adicione um comentário..."
                              className="flex-1 bg-slate-800 border border-slate-600 rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <button
                              type="submit"
                              disabled={!commentInput.trim()}
                              className="p-2 bg-sky-600 rounded-full hover:bg-sky-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
                            >
                              <i
                                data-lucide="send-horizontal"
                                className="w-5 h-5 text-white"
                              ></i>
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-gray-500 animate-fade-in">
              <i
                data-lucide="message-square-off"
                className="w-16 h-16 mx-auto mb-4"
              ></i>
              <h3 className="text-xl font-semibold">
                {filter === 'mine'
                  ? 'Nenhuma publicação sua ainda 📭'
                  : 'Nenhuma publicação encontrada'}
              </h3>
              <p className="mt-2">
                {filter === 'mine'
                  ? 'Você ainda não publicou nada. Compartilhe sua primeira reflexão! ✨'
                  : 'Parece que não há publicações que correspondam aos seus filtros.'}
              </p>
            </div>
          )}
        </div>

        {/* Navegação do mural */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          {/* Voltar para a jornada – só aparece enquanto NÃO concluiu tudo */}
          {!isJourneyCompleted && (
            <ActionButton
              onClick={goBackToJourneyNextStage}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 focus:ring-emerald-300"
            >
              <i
                data-lucide="arrow-left"
                className="inline-block mr-2 w-5 h-5"
              ></i>
              Voltar para a Jornada
            </ActionButton>
          )}

          {/* Voltar à Tela Final – só habilita quando a jornada estiver concluída */}
          <ActionButton
            onClick={() => navigateTo(Screen.Final)}
            disabled={!isJourneyCompleted}
            className="bg-gradient-to-r from-gray-600 to-gray-800 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i
              data-lucide="arrow-left"
              className="inline-block mr-2 w-5 h-5"
            ></i>
            Voltar à Tela Final
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default CommunityWallScreen;
