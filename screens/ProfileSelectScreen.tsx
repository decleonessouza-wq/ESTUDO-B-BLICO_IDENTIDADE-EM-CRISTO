import React, { useEffect, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";

const LOCAL_STORAGE_KEY = "identidadeCristoProgress";
const PROFILE_LIST_KEY = "identidadeCristoProfileList";
const LAST_PROFILE_ID_KEY = "identidadeCristoLastProfileId";

type StoredProfile = {
  id: string;
  name: string;
  birthDate: string | null;
};

const ProfileSelectScreen: React.FC = () => {
  const { login, navigateTo } = useAppContext();
  const [profiles, setProfiles] = useState<StoredProfile[]>([]);

  // carrega a lista de perfis salvos neste dispositivo
  useEffect(() => {
    try {
      const rawList = localStorage.getItem(PROFILE_LIST_KEY);
      if (!rawList) {
        setProfiles([]);
        return;
      }

      const ids: string[] = JSON.parse(rawList);
      const loaded: StoredProfile[] = [];

      ids.forEach((id) => {
        const key = `${LOCAL_STORAGE_KEY}:${id}`;
        const rawProgress = localStorage.getItem(key);
        if (!rawProgress) return;

        try {
          const data = JSON.parse(rawProgress) as {
            userName?: string;
            birthDate?: string | null;
          };

          loaded.push({
            id,
            name: data.userName || "Participante",
            birthDate: data.birthDate ?? null,
          });
        } catch {
          // ignora perfis quebrados
        }
      });

      setProfiles(loaded);
    } catch (err) {
      console.error("Erro ao carregar perfis salvos:", err);
      setProfiles([]);
    }
  }, []);

  const handleEnterProfile = async (profile: StoredProfile) => {
    // login com o mesmo nome e data pra gerar o mesmo userId
    await login(profile.name, profile.birthDate || "");
    // marca como último perfil usado
    try {
      localStorage.setItem(LAST_PROFILE_ID_KEY, profile.id);
    } catch (err) {
      console.error("Erro ao salvar último perfil:", err);
    }
    navigateTo(Screen.Instructions);
  };

  const handleNewProfile = () => {
    // vai para a tela de boas-vindas / cadastro padrão
    navigateTo(Screen.Welcome);
  };

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-white text-center border border-blue-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Escolher perfil neste dispositivo
        </h1>
        <p className="text-sm md:text-base text-gray-300 mb-6">
          Cada perfil tem sua própria jornada, pontuação e diário espiritual.
        </p>

        {profiles.length === 0 ? (
          <div className="border border-dashed border-slate-500 rounded-xl p-6 text-sm text-slate-300 mb-8">
            <p>Não encontramos nenhum perfil salvo ainda.</p>
            <p className="mt-1">
              Crie um novo perfil para começar a jornada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleEnterProfile(profile)}
                className="text-left bg-slate-900/80 border border-slate-600 rounded-xl p-4 hover:border-sky-400 hover:bg-slate-900 transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-400">Perfil</p>
                    <p className="text-lg font-semibold text-sky-200">
                      {profile.name}
                    </p>
                  </div>
                  <i
                    data-lucide="user"
                    className="w-7 h-7 text-sky-300"
                  />
                </div>
                {profile.birthDate && (
                  <p className="text-xs text-slate-400">
                    Nascimento:{" "}
                    <span className="font-mono">
                      {profile.birthDate}
                    </span>
                  </p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">
                  Toque para continuar de onde parou nessa jornada.
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <ActionButton onClick={handleNewProfile}>
            Criar novo perfil
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default ProfileSelectScreen;
