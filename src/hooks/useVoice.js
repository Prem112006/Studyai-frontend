import { useState, useRef, useEffect } from 'react';

export const useVoice = () => {
  // ==========================================
  // Text-To-Speech (Speech Synthesis)
  // ==========================================
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

  const speak = (text) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing voice
    synthRef.current.cancel();

    // Strip markdown tags for clean reading
    const cleanText = text
      .replace(/[#*`_-]/g, ' ')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  // ==========================================
  // Speech-To-Text (Speech Recognition)
  // ==========================================
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Safari.');
      return;
    }
    setTranscript('');
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
  };
};
