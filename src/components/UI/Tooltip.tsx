import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top' 
}) => {
  const [show, setShow] = useState(false);
  
  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1",
    bottom: "top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1",
    left: "right-full top-1/2 transform -translate-x-2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 transform translate-x-2 -translate-y-1/2 ml-1",
  };
  
  const arrowPositions = {
    top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1 border-t-black dark:border-t-metal-darker border-l-transparent border-r-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 border-b-black dark:border-b-metal-darker border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 transform -translate-x-1 -translate-y-1/2 border-l-black dark:border-l-metal-darker border-t-transparent border-b-transparent border-r-transparent",
    right: "right-full top-1/2 transform translate-x-1 -translate-y-1/2 border-r-black dark:border-r-metal-darker border-t-transparent border-b-transparent border-l-transparent",
  };
  
  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className={`absolute z-50 ${positions[position]}`}>
          <div className="bg-black/90 dark:bg-metal-darker/95 text-white px-2 py-1 rounded text-xs max-w-[250px] whitespace-normal break-words">
            {content}
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowPositions[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;