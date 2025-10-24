
import { useCallback, useMemo } from 'react';

export const useSound = (soundSrc: string, volume: number = 0.5) => {
  const audio = useMemo(() => {
    if (typeof Audio !== 'undefined') {
        const a = new Audio(soundSrc);
        a.volume = volume;
        return a;
    }
    return null;
  }, [soundSrc, volume]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => console.error("Audio play failed", error));
    }
  }, [audio]);

  return play;
};
