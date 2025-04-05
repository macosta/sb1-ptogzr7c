import React, { useEffect, useState } from 'react';
import { cn, STANDARD_TUNING, frequencyToNote } from '../../lib/utils';
import { useTuner } from '../../hooks/useAudio';
import { Mic, MicOff, Repeat } from 'lucide-react';

const Tuner: React.FC = () => {
  const { isListening, frequency, startListening, stopListening } = useTuner();
  const [targetString, setTargetString] = useState(0); // 0 = high E, 5 = low E
  const [note, setNote] = useState<{ note: string; octave: number; cents: number } | null>(null);
  const [highlightedString, setHighlightedString] = useState<string | null>(null);
  
  // Get standard tuning reversed (high E to low E)
  const tuning = STANDARD_TUNING;
  
  useEffect(() => {
    if (frequency) {
      const detected = frequencyToNote(frequency);
      setHighlightedString(detected.note);
      setNote(detected);
    } else {
      setHighlightedString(null);
      setNote(null);
    }
  }, [frequency]);
  
  const isInTune = note && Math.abs(note.cents) < 5;
  const isTooLow = note && note.cents < -5;
  const isTooHigh = note && note.cents > 5;
  
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Guitar Tuner</h2>
        
        <button 
          className={cn(
            "p-3 rounded-full transition-colors",
            isListening ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary-500 hover:bg-primary-600 text-white"
          )}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
      
      <div className="flex justify-center mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">
            {note ? note.note : '--'}
          </div>
          <div className="text-sm text-gray-500">
            {note ? `Octave: ${note.octave}` : 'Play a string'}
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 overflow-hidden">
          <div 
            className={cn(
              "absolute top-0 bottom-0 w-1 bg-primary-500 transition-all",
              !note && "opacity-0"
            )}
            style={{ 
              left: note ? `calc(50% + ${note.cents * 1.5}px)` : '50%',
              transform: 'translateX(-50%)'
            }}
          />
          
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-400 dark:bg-gray-500" />
          
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-gray-400 dark:bg-gray-500" />
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-gray-400 dark:bg-gray-500" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>-50 cents</span>
          <span className={cn(isInTune && "text-green-500 font-bold")}>Perfect</span>
          <span>+50 cents</span>
        </div>
        
        <div className="mt-4 text-center">
          {isTooLow && <p className="text-blue-500">Tune higher ↑</p>}
          {isInTune && <p className="text-green-500">In tune! ✓</p>}
          {isTooHigh && <p className="text-red-500">Tune lower ↓</p>}
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Choose String</h3>
        
        <div className="flex justify-center space-x-2">
          {['E', 'A', 'D', 'G', 'B', 'E'].map((note, i) => (
            <button
              key={i}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                targetString === i 
                  ? "border-primary-500 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                  : note && note.note === note
                  ? "border-blue-500 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700"
              )}
              onClick={() => setTargetString(i)}
            >
              {note}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Target: {['E', 'A', 'D', 'G', 'B', 'E'][targetString]} string</p>
        </div>
      </div>
    </div>
  );
};

export default Tuner;