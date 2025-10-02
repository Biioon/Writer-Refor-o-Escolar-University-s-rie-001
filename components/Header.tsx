import React from 'react';
import { Settings, Bell, UserCircle2, GraduationCap, Shield } from 'lucide-react';
import BackgroundSelector from './BackgroundSelector';
import { BackgroundStyle } from '../types';

interface HeaderProps {
    currentBackground: BackgroundStyle;
    setCurrentBackground: (style: BackgroundStyle) => void;
    onOpenLoginModal: () => void;
    onNavigateToAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentBackground, setCurrentBackground, onOpenLoginModal, onNavigateToAdmin }) => {
  return (
    <header className="flex items-center justify-between p-2 sm:p-3 border-b border-stone-800 bg-stone-950/50 backdrop-blur-sm z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--color-primary)] rounded-lg">
          <GraduationCap className="text-white" size={24} />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-gray-100 hidden sm:block">
          Writer <span className="text-[var(--color-accent)]">University</span>
        </h1>
        <h1 className="text-lg sm:text-xl font-bold text-gray-100 sm:hidden">
          Aprendizado Infantil
        </h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="hidden md:flex">
          <BackgroundSelector selectedStyle={currentBackground} onSelect={setCurrentBackground} />
        </div>
        <button 
          onClick={onNavigateToAdmin}
          className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Painel do Administrador"
        >
          <Shield size={20} />
        </button>
        <button 
          onClick={onOpenLoginModal}
          className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Abrir modal de login"
        >
          <Settings size={20} />
        </button>
        <button className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors">
          <Bell size={20} />
        </button>
        <button 
          onClick={onOpenLoginModal}
          className="flex items-center gap-2 pl-2 pr-3 sm:px-3 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-full text-white transition-colors"
        >
          <UserCircle2 size={20} />
          <span className="hidden lg:inline text-sm font-medium">Entrar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
