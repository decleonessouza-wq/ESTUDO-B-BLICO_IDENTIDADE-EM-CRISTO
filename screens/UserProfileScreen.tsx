import React, { useEffect, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen, UserProfile, StageProgress } from "../types";
import { useUserProfile } from "../hooks/useUserProfile";

const UserProfileScreen: React.FC = () => {
  const {
    userName,
    totalScore,
    stageProgress,
    stagesData,
    completedBonusGames,
    navigateTo,
  } = useAppContext();

  const { profile, updateProfile } = useUserProfile();

  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleFieldChange = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => {
    setLocalProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result?.toString() || null;
      handleFieldChange("avatarDataUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const completedStagesCount = Object.values(stageProgress || {}).filter(
    (p) => (p as StageProgress).completed
  ).length;

  const totalStages = stagesData.length;
  const progressPercent =
    totalStages > 0
      ? Math.round((completedStagesCount / totalStages) * 100)
      : 0;

  // mesmo cálculo simples de level do HUD (ajuste se quiser outro)
  const XP_PER_LEVEL = 200;
  const rawLevel = Math.floor(totalScore / XP_PER_LEVEL) + 1;
  const level = Math.max(1, rawLevel);
  const nextLevelScore = level * XP_PER_LEVEL;

  const handleSave = () => {
    updateProfile({
      ...localProfile,
      totalScore,
      level,
      nextLevelScore,
      // preserva medalhas e streak já existentes
      medals: profile.medals,
      streakDays: profile.streakDays,
    });
  };

  const displayName = userName || "Participante";

  return (
    <AnimatedScreen>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 text-white">
        {/* cabeçalho */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-300">
              Perfil do Usuário
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Sua Identidade Digital
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Personalize como você aparece na jornada e nos relatórios.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo(Screen.Study)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
          >
            Voltar para a Jornada
          </button>
        </div>

        {/* card principal */}
        <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-cyan-500/20">
          {/* avatar + info rápida */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-2 border-cyan-400/80 overflow-hidden bg-slate-800 flex items-center justify-center">
                  {localProfile.avatarDataUrl ? (
                    <img
                      src={localProfile.avatarDataUrl}
                      alt="Avatar do usuário"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <i
                      data-lucide="user"
                      className="w-10 h-10 text-slate-400"
                    />
                  )}
                </div>
                <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-cyan-600 text-white cursor-pointer border border-cyan-300">
                  Trocar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-slate-400">Nome</p>
                <p className="text-lg font-semibold text-sky-100">
                  {displayName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Título espiritual:&nbsp;
                  <span className="font-semibold text-emerald-300">
                    {localProfile.spiritualTitle || "Filho(a) de Deus"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/80 rounded-xl p-2 border border-sky-500/50 text-center">
                <p className="text-[10px] text-slate-400 uppercase">
                  Nível
                </p>
                <p className="text-xl font-bold text-sky-300">{level}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {totalScore}/{nextLevelScore} XP
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-2 border border-emerald-500/50 text-center">
                <p className="text-[10px] text-slate-400 uppercase">
                  Progresso
                </p>
                <p className="text-xl font-bold text-emerald-300">
                  {progressPercent}%
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {completedStagesCount}/{totalStages || "?"} etapas
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-2 border border-amber-500/50 text-center">
                <p className="text-[10px] text-slate-400 uppercase">
                  Pontuação total
                </p>
                <p className="text-xl font-bold text-amber-300">
                  {totalScore ?? 0}
                </p>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-2 border border-pink-500/50 text-center">
                <p className="text-[10px] text-slate-400 uppercase">
                  Jogos bônus
                </p>
                <p className="text-xl font-bold text-pink-300">
                  {completedBonusGames.length}
                </p>
              </div>
            </div>
          </div>

          {/* formulário de personalização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Versículo favorito
                </label>
                <textarea
                  rows={3}
                  value={localProfile.favoriteVerse}
                  onChange={(e) =>
                    handleFieldChange("favoriteVerse", e.target.value)
                  }
                  placeholder='Ex: "Assim que, se alguém está em Cristo, nova criatura é..." (2 Co 5:17)'
                  className="w-full rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Estilo musical preferido
                </label>
                <input
                  type="text"
                  value={localProfile.favoriteMusicStyle}
                  onChange={(e) =>
                    handleFieldChange("favoriteMusicStyle", e.target.value)
                  }
                  placeholder="Adoração, worship, rap gospel, louvor congregacional..."
                  className="w-full rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Igreja / Ministério / Célula
                </label>
                <input
                  type="text"
                  value={localProfile.churchOrGroup}
                  onChange={(e) =>
                    handleFieldChange("churchOrGroup", e.target.value)
                  }
                  placeholder="Ex: Jardim de Oração P90 - Célula Jovem"
                  className="w-full rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Título espiritual
                </label>
                <input
                  type="text"
                  value={localProfile.spiritualTitle}
                  onChange={(e) =>
                    handleFieldChange("spiritualTitle", e.target.value)
                  }
                  placeholder='Ex: "Filho Amado", "Nova Criatura", "Discipulador em Formação"...'
                  className="w-full rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <p className="text-xs text-slate-400">
              Essas informações serão usadas no seu certificado, mural e
              relatórios para o(a) líder.
            </p>
            <ActionButton onClick={handleSave}>
              Salvar Perfil
            </ActionButton>
          </div>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default UserProfileScreen;
