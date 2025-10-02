import React from 'react';
import { Search, Bell, Mail, Settings, LogOut, UserCircle, Menu } from 'lucide-react';
import { Popover } from './ui/Popover';
import { Dropdown } from './ui/Dropdown';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleMobileMenu }) => {
  return (
    <header className="flex-shrink-0 bg-stone-900 border-b border-stone-800 flex items-center justify-between px-4 md:px-6 h-16 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onToggleMobileMenu} className="p-2 rounded-full hover:bg-stone-800 transition-colors md:hidden">
           <Menu size={20} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar..."
            className="bg-stone-800 border border-stone-700 rounded-full py-2 pl-10 pr-4 text-sm w-full max-w-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 rounded-full hover:bg-stone-800 transition-colors md:hidden">
            <Search size={20}/>
        </button>
        <Popover
          trigger={
            <button className="relative p-2 rounded-full hover:bg-stone-800 transition-colors">
              <Mail size={20} />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-blue-500"></span>
            </button>
          }
          content={<div className="p-2 text-sm">Você tem 2 novas mensagens.</div>}
        />
        <Popover
          trigger={
            <button className="relative p-2 rounded-full hover:bg-stone-800 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          }
          content={<div className="p-2 text-sm">Nova atividade atribuída.</div>}
        />
        <div className="w-px h-6 bg-stone-700 hidden md:block"></div>
        <Dropdown
          trigger={
            <button className="flex items-center gap-2">
              <img src="https://i.pravatar.cc/40?u=admin" alt="Admin" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium hidden md:block">Admin</span>
            </button>
          }
          options={['Configurações', 'Suporte', 'Logout']}
          icons={[Settings, UserCircle, LogOut]}
        />
      </div>
    </header>
  );
};

export default AdminHeader;