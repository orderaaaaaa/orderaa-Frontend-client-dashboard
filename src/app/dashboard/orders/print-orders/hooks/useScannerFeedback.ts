'use client';

import { useCallback, useRef } from 'react';
import type { UseScannerFeedbackReturn } from '../types';
import errorSoundFile from '@/assets/sounds/error-sound.mp3';
import successSoundFile from '@/assets/sounds/success.mp3';

export function useScannerFeedback(): UseScannerFeedbackReturn {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine') => {
      try {
        const audioContext = getAudioContext();

        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration / 1000
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    },
    [getAudioContext]
  );

  const playSuccessSound = useCallback(() => {
    try {
      const audio = new Audio(successSoundFile);
      audio.volume = 0.3;
      audio.play();
    } catch {
      playBeep(800, 150);
    }
  }, [playBeep]);

  const playErrorSound = useCallback(() => {
    try {
      const audio = new Audio(errorSoundFile);
      audio.volume = 0.3;
      audio.play();
    } catch {
      playBeep(300, 300);
    }
  }, [playBeep]);

  return { playSuccessSound, playErrorSound };
}
