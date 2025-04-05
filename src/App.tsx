import React, { useState, useEffect, lazy, Suspense } from 'react';
import useGuitarStore from './store/useGuitarStore';
import { cn } from './lib/utils';
import { useStringAudio } from './hooks/useAudio';
import { Music, Zap } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './components/UI/ToggleGroup';
import { InteractiveHoverButton } from './components/UI/InteractiveHoverButton';
import { InteractiveScalesButton } from './components/UI/InteractiveScalesButton';

// Components
import NoteSelector from './components/UI/NoteSelector';
import Fretboard from './components/Guitar/Fretboard';
import ChordLearner from './components/Modes/ChordLearner';
import Tuner from './components/Modes/Tuner';
import Metronome from './components/Modes/Metronome';
import Navigation from './components/UI/Navigation';
import FretboardDisplayModal from './components/UI/FretboardDisplayModal';
import MobileControlPanel from './components/UI/MobileControlPanel';
import FretboardControlsModal from './components/UI/FretboardControlsModal';

// Lazy-loaded components
const Scales = lazy(() => import('./components/Modes/Scales'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="p-6 bg-white dark:bg-metal-darker rounded-lg shadow-md dark:shadow-neon-blue dark:border dark:border-metal-blue">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-metal-lightblue mb-4">Loading...</h2>
  </div>
);

function App() {
  const { 
    mode,
    theme, 
    selectedNote, 
    selectedScale, 
    fretMarkers, 
    setFretMarkers,
    showTriads,
    toggleShowTriads,
    showAllNotes,
    toggleShowAllNotes,
    showRoot,
    toggleShowRoot,
    scaleSystem,
    setScaleSystem,
    setFretboardOrientation
  } = useGuitarStore();
  
  const [showChords, setShowChords] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fretModalOpen, setFretModalOpen] = useState(false);
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const { playString } = useStringAudio();
  
  // Check if device is mobile using both user agent and screen size
  useEffect(() => {
    const checkMobile = () => {
      // Check screen size first
      const isSmallScreen = window.innerWidth <= 768;
      
      // Then check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      
      // Set mobile state if either condition is true
      const mobile = isSmallScreen || isMobileDevice;
      
      // Log for debugging
      console.log('Mobile Detection:', {
        width: window.innerWidth,
        isSmallScreen,
        userAgent,
        isMobileDevice,
        mobile
      });
      
      setIsMobile(mobile);
      
      // Force vertical orientation for mobile
      if (mobile) {
        setFretboardOrientation('standard');
        setMobileControlsOpen(false); // Close controls panel by default
        
        // Lock screen orientation to portrait if supported
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('portrait').catch(() => {
            // Silently fail if orientation lock is not supported
            console.log('Screen orientation lock not supported');
          });
        }
      }
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    // Force a resize event after a short delay to ensure proper detection
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [setFretboardOrientation]);

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-metal-dark text-gray-900 dark:text-gray-100 transition-colors duration-300",
      isMobile && "mobile-layout"
    )}>
      {/* Main Navigation Bar - Only show on desktop */}
      {!isMobile && <Navigation />}
      
      {/* Mobile Control Panel */}
      {isMobile && (
        <MobileControlPanel
          isOpen={mobileControlsOpen}
          onToggle={() => setMobileControlsOpen(!mobileControlsOpen)}
          showChords={showChords}
          setShowChords={setShowChords}
        />
      )}
      
      {/* Note Selection Bar */}
      <div className={cn(
        "bg-black dark:bg-metal-darker border-b border-metal-blue shadow-neon-blue p-2",
        isMobile && "mt-14" // Add margin for mobile header
      )}>
        <div className="mx-auto">
          <NoteSelector />
        </div>
      </div>
    
      <div className={cn(
        "max-w-full mx-auto px-4 py-6",
        isMobile && "pt-4" // Reduced padding for mobile
      )}>
        <div className="w-full">
          {/* Main content */}
          <div className="space-y-6">
            {/* Desktop Control Panel */}
            {!isMobile && (
              <div className="relative flex flex-col md:flex-row justify-center md:items-center mb-2 py-1 px-2 bg-white dark:bg-metal-darkest border dark:border-metal-blue rounded-lg shadow-sm dark:shadow-neon-blue transition-colors duration-300">
                {/* Controls Button */}
                <button
                  onClick={() => setControlsModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-metal-blue text-white hover:bg-metal-lightblue transition-colors flex items-center space-x-2 font-metal-mania"
                >
                  <Zap className="w-4 h-4" />
                  <span>Fretboard Controls</span>
                </button>
              </div>
            )}

            {/* Guitar visualization */}
            <div className={cn(
              "bg-white dark:bg-metal-darker rounded-lg shadow-md dark:shadow-neon-blue dark:border dark:border-metal-blue p-4 overflow-x-auto transition-all duration-300",
              isMobile && "h-[calc(100vh-12rem)] mt-0"
            )}>
              {mode === 'fretboard' && (
                <Fretboard showChords={showChords} setShowChords={setShowChords} />
              )}
              {mode === 'chords' && <ChordLearner />}
              {mode === 'scales' && (
                <Suspense fallback={<LoadingFallback />}>
                  <Scales />
                </Suspense>
              )}
              {mode === 'tuner' && <Tuner />}
              {mode === 'metronome' && <Metronome />}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fretboard Display Modal */}
      <FretboardDisplayModal 
        open={fretModalOpen} 
        onOpenChange={(open) => setFretModalOpen(open)}
      />

      {/* Fretboard Controls Modal */}
      <FretboardControlsModal
        open={controlsModalOpen}
        onOpenChange={setControlsModalOpen}
        showChords={showChords}
        setShowChords={setShowChords}
      />
    </div>
  );
}

export default App;