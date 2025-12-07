// hooks/useSound.ts
import { useCallback } from "react";
import { SOUNDS } from "../constants";

// Mapa para acesso rápido aos dados de cada som
const soundDataMap: Record<string, { id: string; src: string }> =
  Object.values(SOUNDS).reduce((acc, sound) => {
    acc[sound.id] = sound;
    return acc;
  }, {} as Record<string, { id: string; src: string }>);

/**
 * Hook para tocar efeitos sonoros.
 *
 * - Cria um novo Audio a cada play() (o browser faz cache do arquivo).
 * - Não depende mais de isAudioUnlocked no contexto.
 * - Sons disparados por clique/toque do usuário sempre vão tocar,
 *   mesmo depois de fechar e reabrir o app.
 */
export const useSound = (soundId: string, volume: number = 0.5) => {
  const play = useCallback(() => {
    const soundData = soundDataMap[soundId];

    if (!soundData || !soundData.src) {
      console.error(
        `Sound data para id "${soundId}" não encontrado ou sem src.`
      );
      return;
    }

    try {
      const audio = new Audio(soundData.src);
      audio.volume = volume;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // AbortError é comum se o usuário navega rápido ou outro som interrompe.
          if (error.name !== "AbortError") {
            console.error(
              `Falha ao tocar áudio para src: ${soundData.src}`,
              error
            );
          }
        });
      }
    } catch (e) {
      console.error(`Erro ao tocar som com id "${soundId}":`, e);
    }
  }, [soundId, volume]);

  return play;
};
