import React, { useState, useRef, useEffect } from 'react';
import { Book, ChevronUp, Search } from 'lucide-react';

interface SubjectSelectorProps {
  onSelect: (message: string) => void;
}

const subjects = [
  'Matemática',
  'Português',
  'Ciências',
  'Geografia',
  'Desenho',
  'Educação Física',
  'Inglês',
  'História',
];

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState('');
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


  const handleSelect = (subject: string) => {
    setSelectedSubject(subject);
    onSelect(`Me ajude a estudar ${subject}`);
    setIsOpen(false);
    setCustomSubject('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(customSubject.trim()){
          handleSelect(customSubject.trim());
      }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex w-full sm:w-auto items-center justify-center gap-2 text-xs bg-stone-800 hover:bg-stone-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
      >
        <Book size={14} className="text-[var(--color-accent)]"/> 
        <span className="truncate">{selectedSubject || 'Clique na Matéria'}</span>
        <ChevronUp size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-64 bg-stone-900 border border-stone-700 rounded-lg shadow-2xl p-3 z-20">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {subjects.map(subject => (
              <button 
                key={subject}
                onClick={() => handleSelect(subject)}
                className="text-xs text-left p-2 bg-stone-800 hover:bg-[var(--color-primary)] rounded-md transition-colors w-full"
              >
                {subject}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="relative">
            <input 
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="Ou digite uma matéria"
              className="w-full bg-stone-800 border border-stone-700 rounded-lg py-1.5 px-3 pr-8 text-xs text-gray-200 focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
            />
             <button type="submit" aria-label="Confirmar matéria customizada" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={14}/>
             </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectSelector;
