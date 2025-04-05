import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { cn, getFretboardNotes, getScalePattern, CHORDS, SCALES, getNoteAtFret, getScaleDegree, getIntervalName, getAllChordPositions } from '../../lib/utils';
import useGuitarStore from '../../store/useGuitarStore';
import { useStringAudio } from '../../hooks/useAudio';
import { Play, Pause, Minus, Plus, Music, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import FretboardDisplayModal, { noteColorMap } from '../UI/FretboardDisplayModal';
import { InteractiveHoverButton } from '../UI/InteractiveHoverButton';
import { InteractiveScalesButton } from '../UI/InteractiveScalesButton';
import { ToggleGroup, ToggleGroupItem } from '../UI/ToggleGroup';
import './fretboard.css';
import './fretboard.mobile.css';

interface FretboardProps {
  className?: string;
  showChords?: boolean;
  setShowChords?: (show: boolean) => void;
  setChordInfo?: (info: { name: string | null; type: 'Major' | 'Minor' | 'Chord'; positions: any[] }) => void;
}

// Map of enharmonic equivalents (both directions).
const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
};

const Fretboard: React.FC<FretboardProps> = ({ 
  className, 
  showChords: externalShowChords, 
  setShowChords: externalSetShowChords,
  setChordInfo
}) => {
  const { 
    tuning, 
    numFrets, 
    visibleFrets,
    setVisibleFrets,
    showTriads,
    toggleShowTriads,
    toggleShowAllNotes,
    toggleShowRoot,
    fretMarkers,
    showAllNotes,
    showRoot,
    selectedScale,
    selectedNote,
    selectedChord,
    setFretMarkers,
    hasActiveSelection,
    scaleSystem,
    setScaleSystem,
    playNote,
    fretboardOrientation,
    setSelectedNote,
    setSelectedScale,
    setSelectedChord,
    noteColorMode,
    noteColor,
  } = useGuitarStore();
  
  const { playString } = useStringAudio();
  const [fretModalOpen, setFretModalOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  
  // Use internal state if no external control is provided
  const [internalShowChords, setInternalShowChords] = useState(false);
  const showChords = externalShowChords ?? internalShowChords;
  const setShowChords = externalSetShowChords ?? setInternalShowChords;
  
  // State to detect mobile view
  const [isMobile, setIsMobile] = useState(false);
  const [fretboardVertical, setFretboardVertical] = useState(false);
  
  // Update mobile state on resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Set vertical layout for mobile
      setFretboardVertical(mobile);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Debug when props or state changes
  useEffect(() => {
    console.log("[Fretboard] State/props update:", { 
      showChords, 
      externalShowChords, 
      internalShowChords,
      selectedNote,
      selectedChord,
      selectedScale,
      isMobile,
      fretboardVertical
    });
  }, [showChords, externalShowChords, internalShowChords, selectedNote, selectedChord, selectedScale, isMobile, fretboardVertical]);
  
  // Update internal chord display state when a chord is selected
  useEffect(() => {
    if (selectedChord && !showChords) {
      console.log("[Fretboard] Auto-enabling chord display mode due to chord selection");
      setInternalShowChords(true);
    }
  }, [selectedChord, showChords]);
  
  // Calculate fretboard notes - ensuring this calculation is done properly
  const fretboardNotes = useMemo(() => {
    return getFretboardNotes(tuning, numFrets);
  }, [tuning, numFrets]);
  
  // Calculate scale pattern if a scale is selected
  const scalePattern = useMemo(() => {
    return getScalePattern(selectedScale, tuning, numFrets);
  }, [selectedScale, tuning, numFrets]);
  
  // Generate chord positions for the selected note or chord
  const chordPositions = useMemo(() => {
    if ((!selectedNote && !selectedChord) || !showChords) return [];
    
    if (selectedChord) {
      return getAllChordPositions(selectedChord, tuning, numFrets);
    } else if (selectedNote) {
      // Build chord name - try major first, then minor if needed
      const majorChordName = `${selectedNote} Major`;
      const minorChordName = `${selectedNote} Minor`;
      
      if (CHORDS[majorChordName as keyof typeof CHORDS]) {
        return getAllChordPositions(majorChordName, tuning, numFrets);
      } else if (CHORDS[minorChordName as keyof typeof CHORDS]) {
        return getAllChordPositions(minorChordName, tuning, numFrets);
      }
    }
    
    return [];
  }, [selectedNote, selectedChord, tuning, numFrets, showChords]);
  
  // Get the chord notes as an array for filtering
  const chordNotes = useMemo(() => {
    if ((!selectedNote && !selectedChord) || !showChords) return [];
    
    // If a specific chord is selected, use its notes
    if (selectedChord && CHORDS[selectedChord as keyof typeof CHORDS]) {
      return CHORDS[selectedChord as keyof typeof CHORDS];
    }
    
    // Otherwise build chord name from selected note
    if (selectedNote) {
      const majorChordName = `${selectedNote} Major`;
      const minorChordName = `${selectedNote} Minor`;
      
      // Check if the chord exists in our database and get its notes
      if (CHORDS[majorChordName as keyof typeof CHORDS]) {
        return CHORDS[majorChordName as keyof typeof CHORDS];
      } else if (CHORDS[minorChordName as keyof typeof CHORDS]) {
        return CHORDS[minorChordName as keyof typeof CHORDS];
      }
    }
    
    return [];
  }, [selectedNote, selectedChord, showChords]);
  
  // Update parent state when needed
  React.useEffect(() => {
    if (setChordInfo && showChords && chordPositions.length > 0) {
      // Determine if it's a major or minor chord
      let chordType: 'Major' | 'Minor' | 'Chord' = 'Chord';
      let chordName = selectedNote;
      
      if (selectedChord) {
        const parts = selectedChord.split(' ');
        chordName = parts[0];
        if (selectedChord.includes('Major')) {
          chordType = 'Major';
        } else if (selectedChord.includes('Minor')) {
          chordType = 'Minor';
        }
      } else if (selectedNote) {
        // Build chord name
        const majorChordName = `${selectedNote} Major`;
        const minorChordName = `${selectedNote} Minor`;
        
        // Check if the chord exists in our database
        if (CHORDS[majorChordName as keyof typeof CHORDS]) {
          chordType = 'Major';
        } else if (CHORDS[minorChordName as keyof typeof CHORDS]) {
          chordType = 'Minor';
        }
      }
      
      setChordInfo({
        name: chordName,
        type: chordType,
        positions: chordPositions
      });
    }
  }, [chordPositions, selectedNote, selectedChord, showChords, setChordInfo]);
  
  // Update debug info when selections change
  useEffect(() => {
    if (showDebugOverlay) {
      updateGlobalDebugInfo();
    }
  }, [selectedNote, selectedScale, selectedChord, showChords, showTriads, showAllNotes, showRoot]);
  
  // Update global state debug info
  const updateGlobalDebugInfo = useCallback(() => {
    const selectedChordType = selectedChord 
      ? (selectedChord.includes('Major') ? 'Major' : selectedChord.includes('Minor') ? 'Minor' : 'Other') 
      : null;
    
    const selectedScaleType = selectedScale
      ? selectedScale.split(' ').slice(1).join(' ')
      : null;
    
    const currentNotes = (() => {
      if (selectedChord && CHORDS[selectedChord as keyof typeof CHORDS]) {
        return CHORDS[selectedChord as keyof typeof CHORDS];
      } else if (selectedScale && SCALES[selectedScale as keyof typeof SCALES]) {
        return SCALES[selectedScale as keyof typeof SCALES];
      } else if (selectedNote) {
        return [selectedNote];
      }
      return [];
    })();
    
    setDebugInfo({
      type: 'global',
      state: {
        selectedNote,
        selectedChord,
        selectedChordType,
        selectedScale,
        selectedScaleType,
        chordNotes: chordNotes,
        currentlyVisibleNotes: currentNotes,
        displayOptions: {
          showChords,
          showTriads,
          showAllNotes,
          showRoot,
          fretMarkers,
          hasActiveSelection,
          scaleSystem,
          noteColorMode,
          noteColor
        },
        chordPositions: chordPositions.slice(0, 5), // Limit to first 5 to avoid overflow
        visibleFrets,
        fretboardOrientation,
        tuning,
        isMobile,
        fretboardVertical
      }
    });
  }, [
    selectedNote, selectedChord, selectedScale, chordNotes, 
    showChords, showTriads, showAllNotes, showRoot, fretMarkers,
    hasActiveSelection, scaleSystem, visibleFrets, 
    fretboardOrientation, tuning, chordPositions, noteColorMode, noteColor,
    isMobile, fretboardVertical
  ]);
  
  const handleFretClick = useCallback((stringIndex: number, fretIndex: number) => {
    // Get the note at this fret position for debug display
    const openNote = tuning[stringIndex];
    const noteAtFret = getNoteAtFret(openNote, fretIndex);
    
    // Play the note
    playNote(stringIndex, fretIndex);
    playString(stringIndex, fretIndex);
    
    // Calculate whether this note is in scale/chord
    const isInScale = selectedScale ? (
      fretIndex === 0 
        ? scalePattern[stringIndex][0] 
        : scalePattern[stringIndex][fretIndex]
    ) : false;
    
    const isInChord = chordNotes.includes(noteAtFret);
    const inChordPosition = chordPositions.some(pos => 
      pos.string === stringIndex && pos.fret === fretIndex
    );
    
    // Enhanced debug info for note interactions
    if (showDebugOverlay) {
      const displayStringIndex = fretboardOrientation === 'standard' ? 5 - stringIndex : stringIndex;

      // Update the debug info with detailed information
      setDebugInfo({
        type: 'note',
        stringInfo: {
          displayStringIndex: displayStringIndex, // Visual position (0-5)
          actualStringIndex: stringIndex, // Actual index in tuning array
          openNote: tuning[stringIndex], // Note when string is played open
          stringThickness: displayStringIndex >= 3 ? 'bass' : 'treble'
        },
        tuningColumn: {
          note: openNote,
          isRoot: openNote === selectedNote,
          shouldHighlight: openNote === selectedNote,
          style: {
            backgroundColor: 'rgb(100, 100, 100)',
            color: 'white',
            fontFamily: "'Oswald', sans-serif"
          }
        },
        noteInfo: {
          note: noteAtFret, // The actual note at this fret
          fret: fretIndex,
          isOpenNote: fretIndex === 0,
          openNoteValue: tuning[stringIndex]
        },
        musicTheory: {
          selectedRoot: selectedNote,
          degree: selectedNote ? getScaleDegree(noteAtFret, selectedNote) : null,
          interval: selectedNote ? getIntervalName(noteAtFret, selectedNote) : null
        },
        scaleInfo: {
          selectedScale: selectedScale,
          inScale: isInScale,
          scalePattern: selectedScale ? `Pattern at this position: ${isInScale ? 'Yes' : 'No'}` : 'No scale selected'
        },
        chordInfo: {
          selectedChord: selectedChord,
          showChords: showChords,
          isInChord: isInChord,
          chordNotes: chordNotes,
          inChordPosition: inChordPosition
        },
        displayLogic: {
          shouldShow: shouldShowNote(noteAtFret, isInScale, stringIndex, fretIndex),
          visibilityReason: getVisibilityReason(noteAtFret, isInScale, stringIndex, fretIndex)
        }
      });
    }
  }, [
    playNote, playString, tuning, selectedScale, scalePattern, 
    chordNotes, chordPositions, showChords, showTriads, 
    fretboardOrientation, selectedNote, selectedChord, 
    showDebugOverlay
  ]);
  
  // Helper function to explain why a note is visible or not
  const getVisibilityReason = useCallback((note: string, isInScale: boolean, stringIndex: number, fretIndex: number) => {
    const isInChord = chordNotes.includes(note);
    const inChordPosition = chordPositions.some(pos => 
      pos.string === stringIndex && pos.fret === fretIndex
    );
    const isRoot = note === selectedNote;
    
    if (!hasActiveSelection) return "No active selection";
    
    if (showChords) {
      if (!isInChord) return "Not in chord";
      if (showTriads && !inChordPosition) return "Not in preferred chord position (triads mode)";
      return "Visible as chord note";
    }
    
    if (selectedScale) {
      if (!isInScale) return "Not in scale";
      if (!showRoot && isRoot) return "Root note hidden (showRoot=false)";
      return "Visible as scale note";
    }
    
    if (selectedNote) {
      if (isRoot) return "Visible as root note";
      if (!showAllNotes) return "Non-root notes hidden (showAllNotes=false)";
      return "Visible (showAllNotes=true)";
    }
    
    return "Visible by default";
  }, [
    selectedNote, selectedScale, chordNotes, chordPositions, 
    showChords, showTriads, hasActiveSelection, showRoot, showAllNotes
  ]);
  
  // Helper to format note text (add sharp/flat)
  const formatNoteText = useCallback((note: string) => {
    if (note.includes('#')) {
      // Show both sharp and flat notation if there's an enharmonic equivalent
      if (note in ENHARMONIC_MAP) {
        return (
          <div className="enharmonic-container">
            <span className="main-note">{note.replace('#', '')}♯</span>
            <span className="alt-note">{ENHARMONIC_MAP[note]}</span>
          </div>
        );
      }
      return (
        <span className="main-note">
          {note.replace('#', '')}♯
        </span>
      );
    } else if (note.includes('b')) {
      // Show both flat and sharp notation if there's an enharmonic equivalent
      if (note in ENHARMONIC_MAP) {
        return (
          <div className="enharmonic-container">
            <span className="main-note">{note.replace('b', '')}♭</span>
            <span className="alt-note">{ENHARMONIC_MAP[note]}</span>
          </div>
        );
      }
      return (
        <span className="main-note">
          {note.replace('b', '')}♭
        </span>
      );
    }
    return <span className="main-note">{note}</span>;
  }, []);

  // Helper to determine marker style based on note
  const getMarkerStyle = useCallback((note: string, isInScale: boolean) => {
    const isRoot = note === selectedNote;
    
    // If showing chords, style appropriately
    if (showChords && chordNotes.length > 0) {
      if (!chordNotes.includes(note)) {
        return null; // Don't show non-chord notes
      }
      
      const isRoot = note === selectedNote || (selectedChord && chordNotes[0] === note);
      
      if (isRoot) {
        return {
          backgroundColor: 'rgb(255, 255, 255)', // White for root
          color: 'black',
          border: '2px solid #ff0000',
          boxShadow: '0 0 5px #ff0000'
        };
      }
      
      // Other chord tones - different colors based on function
      const isThird = chordNotes[1] === note;
      const isFifth = chordNotes[2] === note;
      const isSeventh = chordNotes.length > 3 && chordNotes[3] === note;
      
      // In multi-color mode, use note-specific colors
      if (noteColorMode === 'multi') {
        return {
          backgroundColor: noteColorMap[note] || (isThird ? '#4CAF50' : isFifth ? '#2196F3' : '#FF9800'),
          color: 'white',
          border: 'none'
        };
      }
      
      // In single-color mode, use different shades of the selected color
      if (noteColorMode === 'single') {
        // For single color mode, use the selected color for all chord tones
        return {
          backgroundColor: noteColor,
          color: 'white',
          border: 'none'
        };
      }
      
      // Fallback to traditional chord function colors if needed
      if (isThird) {
        return {
          backgroundColor: '#4CAF50', // Green for thirds
          color: 'white',
          border: 'none'
        };
      } else if (isFifth) {
        return {
          backgroundColor: '#2196F3', // Blue for fifths
          color: 'white',
          border: 'none'
        };
      } else if (isSeventh) {
        return {
          backgroundColor: '#9C27B0', // Purple for sevenths
          color: 'white',
          border: 'none'
        };
      } else {
        return {
          backgroundColor: '#FF9800', // Orange for other extensions
          color: 'white',
          border: 'none'
        };
      }
    }
    
    // If no active selection, don't show any notes
    if (!hasActiveSelection && !selectedNote && !selectedScale) {
      return {
        backgroundColor: 'rgb(255, 255, 255)',
        color: 'black',
        border: 'none'
      };
    }
    
    // For scale notes or individual note display
    if (isRoot) {
      return {
        backgroundColor: 'rgb(255, 255, 255)', // White for root
        color: 'black',
        border: '2px solid #ff0000',
        boxShadow: '0 0 5px #ff0000'
      };
    }
    
    if (isInScale) {
      return {
        backgroundColor: noteColorMode === 'multi' ? noteColorMap[note] || '#4CAF50' : noteColor,
        color: 'white',
        border: 'none'
      };
    }
    
    // Default note style
    return {
      backgroundColor: 'white',
      color: 'black',
      border: 'none'
    };
  }, [selectedNote, selectedChord, selectedScale, showChords, chordNotes, hasActiveSelection, noteColorMode, noteColor]);

  // Helper to determine if note should be displayed
  const shouldShowNote = useCallback((note: string, isInScale: boolean, stringIndex: number, fretIndex: number) => {
    const isInChord = chordNotes.includes(note);
    const inChordPosition = chordPositions.some(pos => 
      pos.string === stringIndex && pos.fret === fretIndex
    );
    
    // Get the actual note at this position (important for open strings)
    const actualNote = fretIndex === 0 ? tuning[stringIndex] : note;
    const isRoot = actualNote === selectedNote;

    // If showing chords, we need special handling
    if (showChords) {
      // For open strings or fretted positions, check if the note is in the chord
      if (fretIndex === 0 ? !chordNotes.includes(tuning[stringIndex]) : !isInChord) {
        return false; // Not in chord, don't show
      }

      // If showTriads is enabled, only show notes that are part of chord positions
      if (showTriads) {
        return inChordPosition;
      }
      
      // If showTriads is disabled or undefined, show all occurrences of chord notes
      return true;
    }
    
    // If no active selection, don't show any notes
    if (!hasActiveSelection) return false;
    
    // If a specific note is selected and this is that note (including open strings)
    if (selectedNote && !selectedScale && !showChords) {
      // For open strings, compare the open string note directly
      if (fretIndex === 0) {
        return showAllNotes || tuning[stringIndex] === selectedNote;
      }
      // For fretted positions
      if (note === selectedNote) return true;
      return showAllNotes;
    }
    
    // If a scale is selected, show notes according to scale settings
    if (selectedScale) {
      // For open strings (fret 0), check if the note is in the scale
      if (fretIndex === 0) {
        const openNote = tuning[stringIndex];
        return SCALES[selectedScale as keyof typeof SCALES]?.includes(openNote) || false;
      }
      return isInScale; // For other frets, use the scale pattern
    }
    
    // Default fallback - this uses showAllNotes from the store
    return showAllNotes || (isInScale && (showRoot ? true : note !== selectedNote));
  }, [hasActiveSelection, showChords, chordNotes, chordPositions, selectedNote, selectedScale, showAllNotes, showRoot, showTriads, tuning]);

  // Helper to get tuning note color
  const getTuningNoteColor = useCallback((note: string) => {
    // Check if note is the root or in chord/scale
    const isRoot = note === selectedNote;
    const isInChord = showChords && chordNotes.includes(note);
    const isInScale = selectedScale && SCALES[selectedScale as keyof typeof SCALES]?.includes(note);
    
    // If it's the root note, always return white
    if (isRoot) {
      return 'rgb(255, 255, 255)';
    }
    
    // For chord or scale notes, use the appropriate color based on mode
    if ((showChords && isInChord) || (selectedScale && isInScale)) {
      return noteColorMode === 'multi' ? noteColorMap[note] || '#4CAF50' : noteColor;
    }

    return 'rgb(100, 100, 100)'; // Default color for other notes
  }, [selectedNote, selectedChord, selectedScale, showChords, chordNotes, noteColorMode, noteColor]);

  // Standard marker positions
  const markerPositions = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
  
  // Define tuning arrays for both orientations using the actual tuning from store
  const standardTuning = fretboardOrientation === 'standard' 
    ? [...tuning].reverse() // High E to Low E (standard display) - use copy to avoid mutation
    : tuning; // Low E to High E (flipped display) - use original tuning
  
  // Toggle chord display
  const handleChordToggle = useCallback(() => {
    if (!selectedNote) return; // Don't toggle if no root note is selected
    
    // Log for debugging
    console.log("[Fretboard] handleChordToggle called, current showChords:", showChords);
    setShowChords(!showChords);
  }, [selectedNote, showChords, setShowChords]);

  // Toggle debug overlay
  const toggleDebugOverlay = useCallback(() => {
    if (!showDebugOverlay) {
      updateGlobalDebugInfo();
    }
    setShowDebugOverlay(!showDebugOverlay);
  }, [showDebugOverlay, updateGlobalDebugInfo]);

  // Helper to format note based on fretMarkers setting
  const formatNote = useCallback((note: string) => {
    if (!selectedNote) return formatNoteText(note);
    if (fretMarkers === 'none') return '';
    
    switch (fretMarkers) {
      case 'degrees':
        const degree = getScaleDegree(note, selectedNote);
        return <span className="text-sm" style={{ fontFamily: "'Oswald', sans-serif" }}>{degree}</span>;
      case 'intervals':
        const interval = getIntervalName(note, selectedNote);
        return <span className="text-sm" style={{ fontFamily: "'Oswald', sans-serif" }}>{interval}</span>;
      default:
        return formatNoteText(note);
    }
  }, [fretMarkers, selectedNote, formatNoteText]);
  
  // Mock note selection for debug purposes
  const handleDebugNoteSelect = useCallback((note: string) => {
    setSelectedNote(note);
    setSelectedScale('');
    setSelectedChord('');
    if (showDebugOverlay) {
      updateGlobalDebugInfo();
    }
  }, [setSelectedNote, setSelectedScale, setSelectedChord, showDebugOverlay, updateGlobalDebugInfo]);
  
  // Render debug note selection row for testing
  const renderDebugNoteSelector = useCallback(() => {
    if (!showDebugOverlay) return null;
    
    const debugNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    
    return (
      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mb-4">
        <div className="text-sm font-bold mb-2">Debug: Select Root Note</div>
        <div className="flex gap-2">
          {debugNotes.map(note => (
            <button 
              key={note}
              className={cn(
                "px-3 py-1 rounded",
                note === selectedNote 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 dark:bg-gray-700"
              )}
              onClick={() => handleDebugNoteSelect(note)}
            >
              {note}
            </button>
          ))}
        </div>
      </div>
    );
  }, [showDebugOverlay, selectedNote, handleDebugNoteSelect]);
  
  // Zoom in/out handlers for mobile
  const handleZoomIn = useCallback(() => {
    if (visibleFrets > 4) {
      setVisibleFrets(visibleFrets - 2);
    }
  }, [visibleFrets, setVisibleFrets]);

  const handleZoomOut = useCallback(() => {
    if (visibleFrets < numFrets) {
      setVisibleFrets(Math.min(visibleFrets + 2, numFrets));
    }
  }, [visibleFrets, numFrets, setVisibleFrets]);
  
  return (
    <div className={cn("relative w-full", className)}>
      {/* Debug Overlay */}
      {showDebugOverlay && debugInfo && (
        <div className="fixed top-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 max-w-md overflow-auto max-h-[80vh]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">
              {debugInfo.type === 'note' ? 'Note Debug Info' : 'Global State Debug'}
            </h3>
            <button 
              onClick={() => setShowDebugOverlay(false)}
              className="p-1 bg-red-500/50 hover:bg-red-500 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {renderDebugNoteSelector()}
          
          <div className="text-xs overflow-y-auto pr-2 max-h-[60vh]">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {/* Responsive Fretboard Container */}
      <div className={cn(
        "relative bg-black rounded-lg overflow-hidden",
        fretboardVertical && "fretboard-container vertical-fretboard-container"
      )}>
        <div className={cn(
          "overflow-x-auto",
          fretboardVertical && "fretboard-scroll-container"
        )}>
          <div className="w-full min-w-[320px] lg:min-w-0">
            <div className={cn(
              "fretboard-wrapper slim-fretboard",
              fretboardVertical && "vertical-fretboard"
            )}>
              {/* Top fret numbers */}
              <div className="flex h-5 bg-black border-b border-gray-700">
                <div className="w-10 flex-shrink-0">
                  {/* Nut indicator */}
                  <div className="h-full flex justify-center items-center text-gray-500 text-xs">
                    Nut
                  </div>
                </div>
                
                {/* Fret numbers */}
                {Array.from({ length: visibleFrets }).map((_, i) => (
                  <div key={i} className="fret-cell flex justify-center items-center text-gray-400 text-xs">
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Fretboard background - appears behind everything */}
              <div className="relative">
                <div className="fretboard-background"></div>
                
                {/* Strings and fret positions */}
                <div className="flex flex-col">
                  {standardTuning.map((openNote, stringIndex) => {
                    // Map string index to the corresponding index in the tuning array
                    // This is the critical fix: use the correct string index for each tuning orientation
                    const actualStringIndex = fretboardOrientation === 'standard'
                      ? 5 - stringIndex  // For standard orientation (high E to low E display)
                      : stringIndex;     // For flipped orientation (low E to high E display)
                    
                    // Set string thickness and color based on string type
                    const isBassTuning = fretboardOrientation === 'standard'
                      ? stringIndex >= 3  // Standard: bottom 3 strings (D, A, E)
                      : stringIndex <= 2; // Flipped: top 3 strings (E, A, D)
                    
                    const stringThickness = isBassTuning ? 1.8 : 1.2;
                    
                    const stringColor = isBassTuning
                      ? 'linear-gradient(to bottom, rgba(200, 150, 80, 0.7), rgba(220, 170, 100, 0.9), rgba(200, 150, 80, 0.7))'
                      : 'linear-gradient(to bottom, rgba(192, 192, 192, 0.7), rgba(220, 220, 220, 0.9), rgba(192, 192, 192, 0.7))';
                    
                    // Determine if open note is the root or should be highlighted
                    const isRoot = openNote === selectedNote;
                    const isInChord = showChords && chordNotes.includes(openNote);
                    const isInScale = selectedScale && SCALES[selectedScale as keyof typeof SCALES]?.includes(openNote);
                    const shouldHighlight = isRoot || (showChords && isInChord) || (selectedScale && isInScale);
                    
                    return (
                      <div key={stringIndex} className="string-row">
                        {/* Tuning note - Using color based on note context */}
                        <div 
                          className="tuning-column"
                          onClick={() => {
                            handleFretClick(actualStringIndex, 0);
                          }}
                          onMouseEnter={() => {
                            if (showDebugOverlay) {
                             // Get note information
                             const isRoot = openNote === selectedNote;
                             const isInChord = chordNotes.includes(openNote);
                             const isInScale = selectedScale ? 
                               SCALES[selectedScale as keyof typeof SCALES]?.includes(openNote)
                               : false;
                             
                             // Determine marker style
                             let markerStyle = {
                               backgroundColor: 'rgb(100, 100, 100)',
                               color: 'white',
                               border: 'none',
                               boxShadow: 'none'
                             };
                             
                             if (showChords && isInChord) {
                               if (isRoot || (selectedChord && chordNotes[0] === openNote)) {
                                 markerStyle = {
                                   backgroundColor: 'rgb(255, 255, 255)',
                                   color: 'black',
                                   border: '2px solid #ff0000',
                                   boxShadow: '0 0 5px #ff0000'
                                 };
                               } else {
                                 // Determine chord tone role
                                 const isThird = chordNotes[1] === openNote;
                                 const isFifth = chordNotes[2] === openNote;
                                 
                                 if (isThird) {
                                   markerStyle.backgroundColor = '#4CAF50';
                                   markerStyle.color = 'white';
                                 } else if (isFifth) {
                                   markerStyle.backgroundColor = '#2196F3';
                                   markerStyle.color = 'white';
                                 }
                               }
                             } else if (selectedScale && isInScale) {
                               markerStyle = {
                                 backgroundColor: '#4CAF50', // Green for scale notes
                                 color: 'white',
                                 border: isRoot ? '2px solid #ff0000' : 'none',
                                 boxShadow: isRoot ? '0 0 5px #ff0000' : 'none'
                               };
                             } else if (isRoot) {
                               markerStyle = {
                                 backgroundColor: 'rgb(255, 255, 255)',
                                 color: 'black',
                                 border: '2px solid #ff0000',
                                 boxShadow: '0 0 5px #ff0000'
                               };
                             }
                             
                              setDebugInfo({
                                type: 'tuning-note',
                                note: openNote,
                               isRoot,
                               isInChord,
                               isInScale,
                                stringIndex: actualStringIndex,
                                displayIndex: stringIndex,
                               shouldHighlight: isRoot || (showChords && isInChord),
                               currentStyle: markerStyle,
                               chordInfo: showChords ? {
                                 chordNotes,
                                 role: isRoot || (selectedChord && chordNotes[0] === openNote) ? 'root' :
                                       chordNotes[1] === openNote ? 'third' :
                                       chordNotes[2] === openNote ? 'fifth' : 'extension'
                               } : null
                              });
                            }
                          }}
                        >
                          <div 
                            className="w-7 h-7 rounded-full flex justify-center items-center font-bold text-sm shadow-md"
                            style={{ 
                              backgroundColor: getTuningNoteColor(openNote),
                              color: isRoot ? 'black' : 'white',
                              border: isRoot ?
                                '2px solid #ff0000' : 'none',
                              boxShadow: isRoot ?
                                '0 0 5px #ff0000' : 'none',
                              fontFamily: "'Oswald', sans-serif"
                            }}
                          >
                            {openNote}
                          </div>
                        </div>
                        
                        {/* Fret grid with string line */}
                        <div className="fret-grid">
                          {/* Horizontal string line - positioned in the middle */}
                          <div 
                            className="string-line"
                            style={{ 
                              height: `${stringThickness}px`,
                              background: stringColor,
                              boxShadow: '0 0 2px rgba(255, 255, 255, 0.3)'
                            }}
                          />
                          
                          {/* Fret lines */}
                          <div className="fret-cells-container">
                            {Array.from({ length: visibleFrets }).map((_, i) => {
                              // Get the fret number (1-based)
                              const fretNumber = i + 1;
                              
                              return (
                                <div key={i} className="fret-position relative">
                                  {/* Fret wire - right edge of each fret position */}
                                  {i < visibleFrets - 1 && (
                                    <div 
                                      className="fret-wire"
                                      style={{
                                        right: 0,
                                        boxShadow: '0 0 1px rgba(255, 255, 255, 0.4)'
                                      }}
                                    />
                                  )}
                                  
                                  {/* Click area covering the full fret space */}
                                  <div 
                                    className="absolute inset-0 cursor-pointer hover:bg-gray-900/30"
                                    onClick={() => {
                                      handleFretClick(actualStringIndex, fretNumber);
                                    }}
                                  />
                                  
                                  {/* Note visualization */}
                                  {(() => {
                                    // Get the correct open note for this string
                                    const openStringNote = tuning[actualStringIndex];

                                    // Calculate the note at this fret position using the correct string note
                                    const note = getNoteAtFret(openStringNote, fretNumber);
                                    
                                    const isInScale = selectedScale ? scalePattern[actualStringIndex][fretNumber] : false;
                                    const shouldShow = shouldShowNote(note, isInScale, actualStringIndex, fretNumber);
                                    const markerStyle = getMarkerStyle(note, isInScale);

                                    return (
                                      shouldShow && markerStyle && (
                                        <div 
                                          className="note-marker"
                                          style={{ 
                                            backgroundColor: markerStyle.backgroundColor,
                                            color: markerStyle.color,
                                            border: markerStyle.border,
                                            boxShadow: markerStyle.boxShadow
                                          }}
                                        >
                                          {formatNote(note)}
                                        </div>
                                      )
                                    );
                                  })()}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Bottom fret markers */}
              <div className="flex h-5 bg-black">
                <div className="w-10 flex-shrink-0" />
                
                {Array.from({ length: visibleFrets }).map((_, i) => (
                  <div key={i} className="fret-cell flex justify-center items-center">
                    {markerPositions.includes(i + 1) && (
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                    )}
                    {(i + 1) === 12 && (
                      <div className="w-2 h-2 rounded-full bg-gray-600 ml-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile zoom controls */}
        {isMobile && (
          <div className="mobile-zoom-controls">
            <button 
              className="mobile-zoom-btn"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              className="mobile-zoom-btn"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Fretboard Display Modal */}
      <FretboardDisplayModal 
        open={fretModalOpen} 
        onOpenChange={(open) => setFretModalOpen(open)}
      />
    </div>
  );
};

export default Fretboard;