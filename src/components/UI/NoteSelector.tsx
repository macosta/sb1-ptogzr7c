import React, { memo } from 'react';
import { cn } from '../../lib/utils';
import { NOTES } from '../../lib/utils';
import useGuitarStore from '../../store/useGuitarStore';

const NoteSelector: React.FC = () => {
  const { selectedNote, setSelectedNote } = useGuitarStore();
  
  const handleNoteClick = (note: string) => {
    setSelectedNote(note);
  };
  
  return (
    <div className="w-full text-white">
      <div className="flex flex-col md:flex-row items-center gap-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
        <span className="text-metal-silver mr-2 uppercase tracking-wider mb-1 md:mb-0 text-xs">Root</span>
        
        <div className="grid grid-cols-6 gap-1 w-full">
          {NOTES.map(note => (
            <button
              key={note}
              className={cn(
                "py-1 px-2 rounded transition-all duration-300 text-center font-semibold text-sm",
                "min-h-8", // Reduced height for mobile
                selectedNote === note
                  ? "bg-metal-blue text-white" 
                  : "bg-metal-darkest text-metal-silver hover:bg-metal-highlight hover:text-black"
              )}
              onClick={() => handleNoteClick(note)}
            >
              {note.includes('#') ? (
                <>
                  {note.replace('#', '')}<sup className="text-xs">#</sup>
                </>
              ) : (
                note
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(NoteSelector);