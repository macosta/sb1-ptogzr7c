import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import useGuitarStore from '../../store/useGuitarStore';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import { InteractiveHoverButton } from './InteractiveHoverButton';
import { InteractiveScalesButton } from './InteractiveScalesButton';

interface FretboardControlsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  showChords: boolean;
  setShowChords: (show: boolean) => void;
}

const FretboardControlsSidebar: React.FC<FretboardControlsSidebarProps> = ({
  isOpen,
  onClose,
  showChords,
  setShowChords,
}) => {
  const {
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
  } = useGuitarStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-metal-darker border-l border-metal-blue shadow-neon-blue z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-metal-darkest">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-metal-blue" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-metal-lightblue">
                  Fretboard Controls
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-metal-darkest transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-metal-silver" />
              </button>
            </div>
            
            {/* Controls */}
            <div className="p-4 space-y-6">
              {/* Harmonic Mode */}
              <div>
                <h3 className="text-sm font-bold text-black dark:text-metal-silver mb-2">
                  Harmonic Mode
                </h3>
                <div className="flex justify-center space-x-2">
                  <InteractiveHoverButton
                    isActive={showChords}
                    onClick={() => setShowChords(!showChords)}
                    setShowChords={setShowChords}
                    className="py-1.5 text-sm"
                  />
                  <InteractiveScalesButton
                    isActive={!!selectedScale}
                    className="py-1.5 text-sm"
                    setShowChords={setShowChords}
                  />
                </div>
              </div>

              {/* Fretboard Markers */}
              <div>
                <h3 className="text-sm font-bold text-black dark:text-metal-silver mb-2">
                  Fretboard Marker
                </h3>
                <ToggleGroup
                  type="single"
                  disabled={!selectedNote || (!showChords && !selectedScale)}
                  value={fretMarkers}
                  onValueChange={(value) => value && setFretMarkers(value as any)}
                  className="bg-black rounded-full p-1 flex flex-wrap justify-center w-full"
                >
                  <ToggleGroupItem value="notes">Notes</ToggleGroupItem>
                  <ToggleGroupItem value="degrees">Degrees</ToggleGroupItem>
                  <ToggleGroupItem value="intervals">Intervals</ToggleGroupItem>
                  <ToggleGroupItem value="none">None</ToggleGroupItem>
                </ToggleGroup>

                {/* Checkboxes */}
                <div className="flex flex-col space-y-2 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTriads}
                      onChange={toggleShowTriads}
                      className="form-checkbox h-4 w-4 text-metal-blue rounded border-metal-blue"
                    />
                    <span className="text-sm text-black dark:text-metal-silver">Triads</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAllNotes}
                      onChange={toggleShowAllNotes}
                      className="form-checkbox h-4 w-4 text-metal-blue rounded border-metal-blue"
                    />
                    <span className="text-sm text-black dark:text-metal-silver">All Notes</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRoot}
                      onChange={toggleShowRoot}
                      className="form-checkbox h-4 w-4 text-metal-blue rounded border-metal-blue"
                    />
                    <span className="text-sm text-black dark:text-metal-silver">Root</span>
                  </label>
                </div>
              </div>

              {/* Scale Fingering System */}
              <div>
                <h3 className="text-sm font-bold text-black dark:text-metal-silver mb-2">
                  Scale Fingering System
                </h3>
                <ToggleGroup
                  type="single"
                  value={scaleSystem}
                  onValueChange={(value) => value && setScaleSystem(value as any)}
                  className="bg-black rounded-full p-1 flex justify-center w-full"
                >
                  <ToggleGroupItem value="3nps">3nps</ToggleGroupItem>
                  <ToggleGroupItem value="caged">CAGED</ToggleGroupItem>
                  <ToggleGroupItem value="none">None</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FretboardControlsSidebar;