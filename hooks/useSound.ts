
import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { SOUNDS } from '../constants';

// Pre-build a dictionary for quick sound data lookup.
const soundDataMap: Record<string, { id: string; src: string }> = 
  Object.values(SOUNDS).reduce((acc, sound) => {
    acc[sound.id] = sound;
    return acc;
  }, {} as Record<string, { id: string; src: string }>);

/**
 * A hook for playing sound effects.
 * This version creates a new Audio object on each play call for robustness,
 * preventing issues with stale element states. The browser handles caching the audio file itself.
 *
 * @param soundId The key of the sound in the SOUNDS constant (e.g., 'sound-click').
 * @param volume The playback volume (0.0 to 1.0).
 */
export const useSound = (soundId: string, volume: number = 0.5) => {
  const { isAudioUnlocked } = useAppContext();

  const play = useCallback(() => {
    // Return early if audio is not yet unlocked by a user gesture.
    if (!isAudioUnlocked) return;
    
    const soundData = soundDataMap[soundId];
    if (!soundData || !soundData.src) {
      console.error(`Sound data for id "${soundId}" not found or has no src.`);
      return;
    }

    try {
      const audio = new Audio(soundData.src);
      audio.volume = volume;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // AbortError is common if another sound is played quickly or the user navigates away.
          // It's generally safe to ignore.
          if (error.name !== 'AbortError') {
            console.error(`Audio play failed for src: ${soundData.src}`, error);
          }
        });
      }
    } catch (e) {
        console.error(`Error playing sound with id "${soundId}":`, e);
    }
  }, [soundId, volume, isAudioUnlocked]);

  return play;
};
