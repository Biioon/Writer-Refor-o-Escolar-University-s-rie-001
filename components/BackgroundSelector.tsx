import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronUp } from 'lucide-react';
import { BackgroundStyle } from '../types';

interface BackgroundSelectorProps {
  onSelect: (style: BackgroundStyle) => void;
  selectedStyle: BackgroundStyle;
}

const styleOptions: { key: BackgroundStyle, label: string }[] = [
  { key: 'particles', label: 'Partículas Estrelas' },
  { key: 'bubbles', label: 'Bolinhas Flutuantes' },
  { key: 'neon_rain', label: 'Chuva de Neon' },
  { key: 'falling_leaves', label: 'Flores e Folhas' },
];

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onSelect, selectedStyle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (style: BackgroundStyle) => {
    onSelect(style);
    setIsOpen(false);
  };
  
  const currentLabel = styleOptions.find(opt => opt.key === selectedStyle)?.label || 'Visual Ambientes';

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-stone-800 rounded-md transition-colors"
      >
        <Sparkles size={16} className="text-[var(--color-accent)]"/> 
        <span>{currentLabel}</span>
        <ChevronUp size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-56 origin-top-right bg-stone-900 border border-stone-700 rounded-lg shadow-2xl p-2 z-20">
            {styleOptions.map(option => (
              <button 
                key={option.key}
                onClick={() => handleSelect(option.key)}
                className="w-full text-left text-sm p-2 rounded-md hover:bg-[var(--color-primary)] transition-colors flex items-center gap-2"
              >
                {option.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
