import React, { useState } from 'react';
import { Home, MessageSquare, BookOpen, Library, FolderKanban, BarChart2, Settings, GraduationCap, ChevronLeft, ChevronRight, DatabaseZap, CreditCard, Triangle, ArrowLeft, Github } from 'lucide-react';
import { AdminView } from '../../types';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    isCollapsed: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, isCollapsed, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  return (
    <a href="#" onClick={handleClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${active ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-stone-800 text-gray-400'}`}>
      <Icon size={20} />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </a>
  );
};

interface AdminSidebarProps {
    onExitAdmin: () => void;
    isOpenOnMobile: boolean;
    onCloseMobile: () => void;
    onOpenConfigModal: (service: string) => void;
    activeView: AdminView;
    onViewChange: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onExitAdmin, isOpenOnMobile, onCloseMobile, onOpenConfigModal, activeView, onViewChange }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleNavClick = (view: AdminView) => {
        onViewChange(view);
        onCloseMobile();
    };

  return (
    <aside className={`
        fixed inset-y-0 left-0 bg-stone-900 border-r border-stone-800 flex flex-col z-40
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        ${isOpenOnMobile ? 'translate-x-0 w-64' : '-translate-x-full'}
    `}>
      <div className={`flex items-center gap-3 p-4 border-b border-stone-800 h-16 ${isCollapsed && !isOpenOnMobile ? 'justify-center' : 'justify-between'}`}>
        <button
          onClick={() => {
            onExitAdmin();
            onCloseMobile();
          }}
          aria-label="Voltar para o aplicativo principal"
          className={`flex items-center gap-3 rounded-lg hover:bg-stone-800 p-1 -m-1 transition-colors ${(isCollapsed && !isOpenOnMobile) ? 'justify-center w-full' : ''}`}
        >
          <div className="p-2 bg-[var(--color-primary)] rounded-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          {(!isCollapsed || isOpenOnMobile) && <span className="font-bold text-white">Writer Admin</span>}
        </button>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-md hover:bg-stone-800 hidden md:block">
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavItem icon={Home} label="Home" active={activeView === 'home'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('home')} />
        <NavItem icon={MessageSquare} label="Chat AI" active={activeView === 'chat_ai'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('chat_ai')} />
        <NavItem icon={BookOpen} label="Caderno" active={activeView === 'notebook'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('notebook')} />
        <NavItem icon={Library} label="Biblioteca" active={activeView === 'library'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('library')} />
        <NavItem icon={FolderKanban} label="Meus Projetos" active={activeView === 'projects'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('projects')} />
        <NavItem icon={BarChart2} label="Estatísticas" active={activeView === 'statistics'} isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => handleNavClick('statistics')} />
        
        <div className="pt-2"> 
            <div className="border-t border-stone-800 -mx-4"></div>
        </div>

        <NavItem icon={DatabaseZap} label="Supabase" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => { onOpenConfigModal('Supabase'); onCloseMobile(); }} />
        <NavItem icon={CreditCard} label="Stripe" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => { onOpenConfigModal('Stripe'); onCloseMobile(); }} />
        <NavItem icon={Triangle} label="Vercel" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => { onOpenConfigModal('Vercel'); onCloseMobile(); }} />
        <NavItem icon={Github} label="GitHub" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={() => { onOpenConfigModal('GitHub'); onCloseMobile(); }} />
      </nav>
      <div className="p-4 border-t border-stone-800">
        <NavItem icon={Settings} label="Configurações" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={onCloseMobile} />
        <NavItem icon={ArrowLeft} label="Voltar ao App" isCollapsed={isCollapsed && !isOpenOnMobile} onClick={onExitAdmin} />
      </div>
    </aside>
  );
};

export default AdminSidebar;