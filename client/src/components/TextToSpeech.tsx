import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechProps {
  text: string;
  enabled: boolean;
  onToggle: () => void;
}

export function TextToSpeech({ text, enabled, onToggle }: TextToSpeechProps) {
  const [isSupported, setIsSupported] = useState(false);
  const lastTextRef = useRef<string>("");
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !text || text === lastTextRef.current || !synthesisRef.current) return;

    // Cancel previous utterance if any
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'th-TH'; // Set language to Thai
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 0.8; // Slightly lower volume to not overpower video

    // Try to find a Thai voice
    const voices = synthesisRef.current.getVoices();
    const thaiVoice = voices.find(voice => voice.lang.includes('th'));
    if (thaiVoice) {
      utterance.voice = thaiVoice;
    }

    synthesisRef.current.speak(utterance);
    lastTextRef.current = text;
    utteranceRef.current = utterance;

  }, [text, enabled]);

  // Handle voice loading (voices are loaded asynchronously in some browsers)
  useEffect(() => {
    if (!synthesisRef.current) return;

    const loadVoices = () => {
      const voices = synthesisRef.current?.getVoices();
      // We don't strictly need to do anything here, just ensure voices are loaded
      // for the next speak call to find a Thai voice if available
    };

    loadVoices();
    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  if (!isSupported) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all ${enabled ? 'text-neon-green' : 'text-white/50'}`}
      title={enabled ? "Mute TTS" : "Enable TTS"}
    >
      {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </Button>
  );
}
