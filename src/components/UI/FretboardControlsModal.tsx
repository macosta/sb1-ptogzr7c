import React, { useState } from 'react';
import { Zap, Sliders } from 'lucide-react';
import { cn } from '../../lib/utils';
import useGuitarStore from '../../store/useGuitarStore';
import { ToggleGroup, ToggleGroupItem } from './ToggleGroup';
import { InteractiveHoverButton } from './InteractiveHoverButton';
import { InteractiveScalesButton } from './InteractiveScalesButton';
import Modal from './Modal';
import FretboardDisplayModal from './FretboardDisplayModal';

interface FretboardControlsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showChords: boolean;
  setShowChords: (show: boolean) => void;
}

const FretboardControlsModal: React.FC<FretboardControlsModalProps> = ({
  open,
  onOpenChange,
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

  const [fretModalOpen, setFretModalOpen] = useState(false);

  return (
    <Modal
      title="Fretboard Controls"
      description="Control panel for fretboard display settings and visualization options"
      open={open}
      onOpenChange={onOpenChange}
      size="md"
    >
      <div className="space-y-6">
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

        {/* Fretboard Display Button */}
        <div>
          <button
            onClick={() => setFretModalOpen(true)}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-metal-darkest text-gray-700 dark:text-metal-silver rounded-md hover:bg-gray-200 dark:hover:bg-metal-dark transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Fretboard Display</span>
          </button>
        </div>
      </div>

      {/* Fretboard Display Modal */}
      <FretboardDisplayModal 
        open={fretModalOpen} 
        onOpenChange={setFretModalOpen}
      />
    </Modal>
  );
};

export default FretboardControlsModal;