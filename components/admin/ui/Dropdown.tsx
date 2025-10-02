import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  trigger: React.ReactNode;
  options: string[];
  icons?: React.ElementType[];
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, options, icons }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute top-full mt-2 w-48 origin-top-right bg-stone-800 border border-stone-700 rounded-lg shadow-2xl p-1 z-30">
          {options.map((option, index) => {
            const Icon = icons && icons[index];
            return (
              <button
                key={option}
                onClick={() => setIsOpen(false)}
                className="w-full text-left text-sm p-2 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                {Icon && <Icon size={16} />}
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
