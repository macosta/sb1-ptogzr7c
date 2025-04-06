import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STANDARD_TUNING } from '../lib/utils';

export type Mode = 'fretboard' | 'chords' | 'scales' | 'tuner' | 'metronome';
export type Theme = 'light' | 'dark';
export type FretMarker = 'notes' | 'degrees' | 'intervals' | 'none';
export type ScaleSystem = '3nps' | 'caged' | 'none' | 'degrees';
export type FretboardOrientation = 'standard' | 'flipped';
export type NoteColorMode = 'single' | 'multi';

interface GuitarState {
  // App state
  mode: Mode;
  theme: Theme;
  showNotesBar: boolean; // Added this line
  
  // Guitar configuration
  tuning: string[];
  numFrets: number;
  visibleFrets: number;
  activeString: number | null;
  activeFret: number | null;
  fretboardOrientation: FretboardOrientation;
  
  // Display options
  fretMarkers: FretMarker;
  showTriads: boolean;
  showChords: boolean;
  showAllNotes: boolean;
  showRoot: boolean;
  
  // Note visualization options
  noteColorMode: NoteColorMode;
  noteColor: string;
  
  // Music theory
  selectedNote: string;
  selectedScale: string;
  selectedChord: string;
  scaleSystem: ScaleSystem;
  
  // Active selection state
  hasActiveSelection: boolean;
  
  // Function actions
  setMode: (mode: Mode) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setTuning: (tuning: string[]) => void;
  setNumFrets: (numFrets: number) => void;
  setVisibleFrets: (frets: number) => void;
  setActiveString: (string: number | null) => void;
  setActiveFret: (fret: number | null) => void;
  playNote: (string: number, fret: number) => void;
  setFretMarkers: (markers: FretMarker) => void;
  setSelectedNote: (note: string) => void;
  setSelectedScale: (scale: string) => void;
  setSelectedChord: (chord: string) => void;
  setScaleSystem: (system: ScaleSystem) => void;
  toggleShowTriads: () => void;
  toggleShowAllNotes: () => void;
  toggleShowRoot: () => void;
  setHasActiveSelection: (active: boolean) => void;
  setFretboardOrientation: (orientation: FretboardOrientation) => void;
  toggleFretboardOrientation: () => void;
  setNoteColorMode: (mode: NoteColorMode) => void;
  setNoteColor: (color: string) => void;
  setShowNotesBar: (show: boolean) => void; // Added this line
  toggleShowNotesBar: () => void; // Added this line
}

// Function to detect system color scheme preference
const getSystemThemePreference = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const useGuitarStore = create<GuitarState>()(
  persist(
    (set) => ({
      // Default state
      mode: 'fretboard',
      theme: getSystemThemePreference(),
      showNotesBar: true, // Added this line with default value
      tuning: STANDARD_TUNING,
      numFrets: 24,
      visibleFrets: 24,
      activeString: null,
      activeFret: null,
      fretboardOrientation: 'standard',
      fretMarkers: 'notes',
      showTriads: false,
      showChords: false,
      showAllNotes: true,
      showRoot: true,
      selectedNote: '',
      selectedScale: '',
      selectedChord: '',
      scaleSystem: 'none',
      hasActiveSelection: true,
      noteColorMode: 'single',
      noteColor: '#4CAF50', // Default green color
      
      // Actions
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
      setTuning: (tuning) => set({ tuning }),
      setNumFrets: (numFrets) => set({ numFrets }),
      setVisibleFrets: (visibleFrets) => set({ visibleFrets }),
      setActiveString: (string) => set({ activeString: string }),
      setActiveFret: (fret) => set({ activeFret: fret }),
      playNote: (string, fret) => {
        set({ activeString: string, activeFret: fret });
        setTimeout(() => set({ activeString: null, activeFret: null }), 500);
      },
      setFretMarkers: (markers) => set({ fretMarkers: markers }),
      setSelectedNote: (note) => set({ 
        selectedNote: note,
        hasActiveSelection: true,
        selectedScale: '',
        selectedChord: '', // Clear selected chord when selecting a note
        mode: 'fretboard'
      }),
      setSelectedScale: (scale) => set({ 
        selectedScale: scale,
        hasActiveSelection: true,
        showChords: false,
        selectedNote: scale ? scale.split(' ')[0] : '',
        selectedChord: '', // Clear selected chord when selecting a scale
      }),
      setSelectedChord: (chord) => set({ 
        selectedChord: chord,
        hasActiveSelection: chord !== '',
        showChords: true,
        selectedNote: chord ? chord.split(' ')[0] : '', // Extract root note from chord name
        selectedScale: '', // Clear selected scale when selecting a chord
        mode: 'fretboard'
      }),
      setScaleSystem: (system) => set({ scaleSystem: system }),
      toggleShowTriads: () => set((state) => ({ showTriads: !state.showTriads })),
      toggleShowAllNotes: () => set((state) => ({ showAllNotes: !state.showAllNotes })),
      toggleShowRoot: () => set((state) => ({ showRoot: !state.showRoot })),
      setHasActiveSelection: (active) => set({ hasActiveSelection: active }),
      setFretboardOrientation: (orientation) => set({ fretboardOrientation: orientation }),
      toggleFretboardOrientation: () => set((state) => ({
        fretboardOrientation: state.fretboardOrientation === 'standard' ? 'flipped' : 'standard'
      })),
      setNoteColorMode: (mode) => set({ noteColorMode: mode }),
      setNoteColor: (color) => set({ noteColor: color }),
      setShowNotesBar: (show) => set({ showNotesBar: show }), // Added this line
      toggleShowNotesBar: () => set((state) => ({ showNotesBar: !state.showNotesBar })), // Added this line
    }),
    {
      name: 'guitar-maestro-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        visibleFrets: state.visibleFrets,
        fretboardOrientation: state.fretboardOrientation,
        showChords: state.showChords,
        noteColorMode: state.noteColorMode,
        noteColor: state.noteColor,
        showNotesBar: state.showNotesBar, // Added this line
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme on page load
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);

export default useGuitarStore;