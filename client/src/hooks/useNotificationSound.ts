import { useCallback, useRef, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

// Base64 encoded notification sound (short pleasant chime)
// This is a simple synthesized notification sound
const NOTIFICATION_SOUND_DATA = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAHj9markup8eTQAFf9vxoWQ4AEGz+/OhYTkAQbP78aFhOQBBs/vxoWE5AEGz+/GhYTkAQbP78aFhOQBBs/vxoWE5AEGz+/GhYTkAQbP78aFhOQBBs/vxoWE5AEGz+/GhYTkAQbP78aFhOQBBs/vxoWE5AEGz+/GhYTkAQbP78aFhOQBBs/vxoWE5AEGz+/GhYTkAQ==`;

interface UseNotificationSoundOptions {
  enabled?: boolean;
  volume?: number;
}

export function useNotificationSound(options?: UseNotificationSoundOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { chatSettings } = useUIStore();
  
  const enabled = options?.enabled ?? chatSettings.soundEnabled;
  const volume = options?.volume ?? chatSettings.volume;

  // Initialize audio on mount
  useEffect(() => {
    // Create AudioContext for better control
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  // Generate a pleasant notification sound using Web Audio API
  const playNotificationSound = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;
      
      // Resume context if suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const currentTime = audioContext.currentTime;
      
      // Create oscillator for the main tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure oscillator - pleasant chime frequency
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(1760, currentTime + 0.05); // A6
      oscillator.frequency.exponentialRampToValueAtTime(1318.5, currentTime + 0.1); // E6
      
      // Configure envelope - quick attack, medium decay
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.3);
      
      // Play sound
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.3);
      
      // Create second tone for richness
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(1318.5, currentTime + 0.05); // E6
      oscillator2.frequency.exponentialRampToValueAtTime(1760, currentTime + 0.15); // A6
      
      gainNode2.gain.setValueAtTime(0, currentTime + 0.05);
      gainNode2.gain.linearRampToValueAtTime(volume * 0.2, currentTime + 0.06);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.35);
      
      oscillator2.start(currentTime + 0.05);
      oscillator2.stop(currentTime + 0.35);
      
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }, [enabled, volume]);

  // Play a subtle pop sound for less intrusive notifications
  const playPopSound = useCallback(async () => {
    if (!enabled) return;
    
    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const currentTime = audioContext.currentTime;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volume * 0.15, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.1);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.1);
      
    } catch (error) {
      console.warn('Failed to play pop sound:', error);
    }
  }, [enabled, volume]);

  return {
    playNotificationSound,
    playPopSound,
    enabled,
    volume,
  };
}

export default useNotificationSound;
