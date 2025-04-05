import { useCallback, useState } from 'react';
import { STANDARD_TUNING, getNoteFrequency } from '../lib/utils';

export function useStringAudio() {
  const playString = useCallback((stringIndex: number, fret: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Get the base note for the string (in standard tuning)
      const baseNote = STANDARD_TUNING[stringIndex];
      
      // Calculate the frequency based on the note and fret
      const baseFreq = getNoteFrequency(baseNote, 3 + Math.floor(stringIndex / 2));
      const freq = baseFreq * Math.pow(2, fret / 12);
      
      // Create oscillator
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      // Create gain node for envelope
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 2);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Start and stop
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 2000);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }, []);
  
  return { playString };
}

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  const startMetronome = useCallback(() => {
    if (isPlaying) return;
    
    const interval = 60000 / bpm;
    setCurrentBeat(0);
    
    const id = window.setInterval(() => {
      setCurrentBeat((prev) => {
        const nextBeat = (prev + 1) % beatsPerMeasure;
        // Play metronome sound
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          // First beat of measure has a higher pitch
          oscillator.frequency.value = nextBeat === 0 ? 1000 : 800;
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          gainNode.gain.setValueAtTime(0.00001, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
          console.error('Metronome audio error:', error);
        }
        
        return nextBeat;
      });
    }, interval);
    
    setIntervalId(id);
    setIsPlaying(true);
  }, [bpm, beatsPerMeasure, isPlaying]);
  
  const stopMetronome = useCallback(() => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPlaying(false);
  }, [intervalId]);
  
  const updateBpm = useCallback((newBpm: number) => {
    setBpm(newBpm);
    if (isPlaying) {
      stopMetronome();
      setTimeout(() => startMetronome(), 10);
    }
  }, [isPlaying, startMetronome, stopMetronome]);
  
  return {
    isPlaying,
    bpm,
    beatsPerMeasure,
    currentBeat,
    startMetronome,
    stopMetronome,
    updateBpm,
    setBeatsPerMeasure,
  };
}

export function useTuner() {
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzerNode = context.createAnalyser();
      
      analyzerNode.fftSize = 2048;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyzerNode);
      
      setAudioContext(context);
      setAnalyzer(analyzerNode);
      setMediaStream(stream);
      setIsListening(true);
      
      // Start detecting pitch
      const detectPitch = () => {
        if (!analyzerNode) return;
        
        const bufferLength = analyzerNode.fftSize;
        const buffer = new Float32Array(bufferLength);
        analyzerNode.getFloatTimeDomainData(buffer);
        
        // Simple autocorrelation for pitch detection
        let maxCorrelation = 0;
        let correlationPos = 0;
        
        for (let i = 0; i < bufferLength / 2; i++) {
          let correlation = 0;
          
          for (let j = 0; j < bufferLength / 2; j++) {
            correlation += Math.abs(buffer[j] * buffer[j + i]);
          }
          
          if (correlation > maxCorrelation) {
            maxCorrelation = correlation;
            correlationPos = i;
          }
        }
        
        if (correlationPos > 0 && maxCorrelation > 0.1) {
          const fundamentalFreq = context.sampleRate / correlationPos;
          if (fundamentalFreq > 60 && fundamentalFreq < 1200) {
            setFrequency(fundamentalFreq);
          }
        }
        
        if (isListening) {
          requestAnimationFrame(detectPitch);
        }
      };
      
      detectPitch();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    
    setAnalyzer(null);
    setIsListening(false);
    setFrequency(null);
  }, [mediaStream, audioContext]);
  
  return {
    isListening,
    frequency,
    startListening,
    stopListening,
  };
}