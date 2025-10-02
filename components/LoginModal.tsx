import React, { useState } from 'react';
import { X, User, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      alert(`Bem-vindo(a), ${username}! Login realizado com sucesso.`);
      onClose();
      setUsername('');
      setPassword('');
    } else {
      alert('Por favor, preencha o usuário e a senha.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-6 w-full max-w-sm m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-stone-700 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-center text-white mb-6">Conecte-se</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium text-gray-400">Usuário</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </span>
                <input 
                  type="text" 
                  id="username" 
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 pl-10 text-sm text-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                  placeholder="seu.usuario"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-400">Senha</label>
               <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <KeyRound size={16} className="text-gray-500" />
                </span>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg p-2.5 pl-10 text-sm text-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="mt-6 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-900 focus:ring-[var(--color-primary)]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
