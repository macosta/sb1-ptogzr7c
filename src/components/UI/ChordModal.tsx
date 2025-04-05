import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Play, ChevronRight, GalleryVerticalEnd, PanelRight, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import useGuitarStore from '../../store/useGuitarStore';
import { useStringAudio } from '../../hooks/useAudio';
import { NOTES, SCALES, CHORDS, getNoteAtFret } from '../../lib/utils';
import Modal from './Modal';

interface ScalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  setSelectedChord: (chord: string) => void;
  setShowChords?: (show: boolean) => void;
}

// Calculate scale counts dynamically based on what's available in the SCALES object
const majorScales = Object.keys(SCALES).filter(scale => scale.includes('Major') && !scale.includes('Pentatonic'));
const minorScales = Object.keys(SCALES).filter(scale => scale.includes('Minor') && !scale.includes('Pentatonic') && !scale.includes('Harmonic') && !scale.includes('Melodic'));
const modeScales = Object.keys(SCALES).filter(scale => 
  scale.includes('Dorian') || 
  scale.includes('Phrygian') || 
  scale.includes('Lydian') || 
  scale.includes('Mixolydian') || 
  scale.includes('Locrian')
);
const harmonicMelodicScales = Object.keys(SCALES).filter(scale => scale.includes('Harmonic') || scale.includes('Melodic'));
const pentatonicScales = Object.keys(SCALES).filter(scale => scale.includes('Pentatonic'));
const bluesScales = Object.keys(SCALES).filter(scale => scale.includes('Blues'));

// Group scales by type with actual counts
const scaleCategories = [
  {
    name: "Major Scales (Ionian)",
    scales: majorScales,
    count: majorScales.length
  },
  {
    name: "Minor Scales (Aeolian)",
    scales: minorScales,
    count: minorScales.length
  },
  {
    name: "Additional Modes",
    scales: modeScales,
    count: modeScales.length
  },
  {
    name: "Harmonic & Melodic Minor",
    scales: harmonicMelodicScales,
    count: harmonicMelodicScales.length
  },
  {
    name: "Pentatonic Scales",
    scales: pentatonicScales,
    count: pentatonicScales.length
  },
  {
    name: "Blues Scales",
    scales: bluesScales,
    count: bluesScales.length
  }
];

// Filter scales based on selected root note
const filterScalesByRoot = (scales: string[], rootNote: string): string[] => {
  if (!rootNote) return scales;
  
  return scales.filter(scale => {
    const scaleParts = scale.split(' ');
    return scaleParts[0] === rootNote;
  });
};

// Type definition for scale information
interface ScaleInfo {
  name: string;
  notes: string[];
  type: string;
  description: string;
  commonChords: string[];
  modes?: string[];
}

const ChordModal: React.FC<ScalesModalProps> = ({ isOpen, onClose, setSelectedChord, setShowChords }) => {
  const { 
    selectedNote, 
    setSelectedScale,
    theme,
    tuning,
    selectedScale
  } = useGuitarStore();
  
  const { playString } = useStringAudio();
  
  // State for the modal
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedChordType, setSelectedChordType] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [chordInfo, setChordInfo] = useState<{
    name: string;
    notes: string[];
    intervals: string[];
    positions: { string: number; fret: number; finger?: number }[];
    description: string;
  } | null>(null);

  // Debug state changes
  useEffect(() => {
    console.log('State changed:', {
      selectedCategory: activeCategory,
      selectedChordType,
      showDetails,
      chordInfo: chordInfo?.name
    });
  }, [activeCategory, selectedChordType, showDetails, chordInfo]);

  // Handle chord selection
  const handleChordSelect = (chordType: string) => {
    console.log('handleChordSelect called with:', chordType);
    
    if (!selectedNote) {
      console.log('No selected note, returning');
      return;
    }
    
    const fullChordName = `${selectedNote} ${chordType}`;
    console.log('Setting selected chord type:', chordType);
    setSelectedChordType(chordType);
    
    // Get chord information
    const chordNotes = CHORDS[fullChordName as keyof typeof CHORDS] || [];
    
    // Get chord positions
    const positions = [];
    for (let string = 0; string < tuning.length; string++) {
      for (let fret = 0; fret <= 12; fret++) {
        const noteAtFret = getNoteAtFret(tuning[string], fret);
        if (chordNotes.includes(noteAtFret)) {
          positions.push({ string, fret });
        }
      }
    }
    
    // Set chord info
    const info = {
      name: fullChordName,
      notes: chordNotes,
      intervals: chordNotes.map((note, i) => {
        if (i === 0) return 'Root';
        if (i === 1) return chordType.includes('Minor') ? 'Minor 3rd' : 'Major 3rd';
        if (i === 2) return 'Perfect 5th';
        return `Extension ${i + 1}`;
      }),
      positions,
      description: `The ${fullChordName} chord consists of the notes ${chordNotes.join(', ')}. ${
        chordType.includes('Minor') 
          ? 'It has a darker, more melancholic sound.'
          : 'It has a bright, stable sound.'
      }`
    };
    
    console.log('Setting chord info:', info);
    setChordInfo(info);
    
    console.log('Setting showDetails to true');
    setShowDetails(true);
  };

  // Apply chord to fretboard
  const handleApplyChord = () => {
    if (!selectedNote || !selectedChordType) return;
    
    const fullChordName = `${selectedNote} ${selectedChordType}`;
    setSelectedChord(fullChordName);
    if (setShowChords) {
      setShowChords(true);
    }
    onClose();
  };

  // Play chord demonstration
  const playChord = () => {
    if (!chordInfo) return;
    
    // Play root note first
    const rootPosition = chordInfo.positions[0];
    if (rootPosition) {
      playString(rootPosition.string, rootPosition.fret);
    }
    
    // Play other chord tones in sequence
    chordInfo.positions.slice(1).forEach((pos, index) => {
      setTimeout(() => {
        playString(pos.string, pos.fret);
      }, (index + 1) * 200);
    });
  };

  return (
    <Modal
      title="Chord Explorer"
      open={isOpen}
      onOpenChange={onClose}
      size="full"
      className="min-h-[400px]"
    >
      <div className="flex flex-col md:flex-row h-auto min-h-[400px] max-h-[80vh]">
        {/* Left sidebar - Chord categories */}
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-gray-200 dark:border-metal-darkest pb-4 md:pb-0 md:pr-4">
          <nav className="p-2 space-y-1">
            {scaleCategories.map((category, index) => (
              <button
                key={category.name}
                className={cn(
                  "w-full px-3 py-2 text-left rounded-md transition-colors flex items-center",
                  activeCategory === index
                    ? "bg-blue-100 dark:bg-metal-dark text-blue-700 dark:text-metal-lightblue font-medium"
                    : "text-gray-700 dark:text-metal-silver hover:bg-gray-100 dark:hover:bg-metal-darkest"
                )}
                onClick={() => {
                  setActiveCategory(index);
                  setShowDetails(false);
                }}
              >
                <span className="flex-1">{category.name}</span>
                <span className="flex items-center justify-center w-6 h-6 text-xs bg-gray-200 dark:bg-metal-darkest rounded-full ml-2">
                  {category.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scale list */}
          {!showDetails ? (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-metal-lightblue mb-4">
                {scaleCategories[activeCategory].name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scaleCategories[activeCategory].scales.map((scale) => (
                  <button
                    key={scale}
                    className={cn(
                      "p-3 text-left rounded-md transition-colors border flex justify-between items-center",
                      selectedChordType === scale
                        ? "bg-blue-50 dark:bg-metal-dark border-blue-200 dark:border-metal-blue"
                        : "border-gray-200 dark:border-metal-darkest hover:bg-gray-50 dark:hover:bg-metal-darkest"
                    )}
                    onClick={() => handleChordSelect(scale)}
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-metal-lightblue">
                        {scale}
                      </div>
                      {selectedNote && (
                        <div className="text-sm text-gray-500 dark:text-metal-silver mt-1">
                          {CHORDS[`${selectedNote} ${scale}` as keyof typeof CHORDS]?.join(' - ')}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-metal-darker" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Scale details view
            <div className="flex-1 overflow-y-auto p-4">
              {chordInfo && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-metal-lightblue">
                        {chordInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-metal-silver mt-1">
                        {selectedChordType}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-metal-darkest transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-metal-silver" />
                    </button>
                  </div>

                  {/* Chord notes */}
                  <div className="bg-gray-50 dark:bg-metal-darkest rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-metal-lightblue mb-2">
                          Notes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {chordInfo.notes.map((note, i) => (
                            <div
                              key={i}
                              className={cn(
                                "px-3 py-1 rounded-full text-sm font-medium",
                                i === 0
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 dark:bg-metal-dark text-gray-800 dark:text-metal-silver"
                              )}
                            >
                              {note}
                              <span className="text-xs ml-1 opacity-75">
                                ({chordInfo.intervals[i]})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={playChord}
                        className="p-2 rounded-full bg-blue-500 dark:bg-metal-blue text-white hover:bg-blue-600 dark:hover:bg-metal-lightblue transition-colors"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Chord description */}
                  <div className="bg-white dark:bg-metal-darker border border-gray-200 dark:border-metal-darkest rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-500 dark:text-metal-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-metal-lightblue mb-2">
                          About this chord
                        </h4>
                        <p className="text-gray-600 dark:text-metal-silver">
                          {chordInfo.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chord positions */}
                  <div className="bg-white dark:bg-metal-darker border border-gray-200 dark:border-metal-darkest rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <GalleryVerticalEnd className="w-5 h-5 text-blue-500 dark:text-metal-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-metal-lightblue mb-2">
                          Common Positions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {chordInfo.positions.slice(0, 6).map((pos, i) => (
                            <div
                              key={i}
                              className="text-sm px-3 py-2 bg-gray-50 dark:bg-metal-darkest rounded"
                            >
                              <span className="text-gray-600 dark:text-metal-silver">
                                String {6 - pos.string}, Fret {pos.fret}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Playing tips */}
                  <div className="bg-white dark:bg-metal-darker border border-gray-200 dark:border-metal-darkest rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-500 dark:text-metal-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-metal-lightblue mb-2">
                          Playing Tips
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-metal-silver">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Start with the root note ({chordInfo.notes[0]})
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Practice transitions between open and barre positions
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            Focus on clean, even string ringing
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer with actions */}
          <div className="border-t border-gray-200 dark:border-metal-darkest p-4 flex justify-between items-center">
            <div>
              {selectedScale && showDetails && (
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver rounded-md hover:bg-gray-200 dark:hover:bg-metal-dark transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  <span>Back to List</span>
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver rounded-md hover:bg-gray-200 dark:hover:bg-metal-dark transition-colors"
              >
                Cancel
              </button>
              
              {selectedChordType && (
                <button
                  onClick={handleApplyChord}
                  className="px-3 py-1.5 bg-blue-500 dark:bg-metal-blue text-white rounded-md hover:bg-blue-600 dark:hover:bg-metal-lightblue transition-colors"
                >
                  Apply to Fretboard
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChordModal;