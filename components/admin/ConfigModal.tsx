import React, { useState, useMemo } from 'react';
import { X, DatabaseZap, CreditCard, Triangle, Github, Cpu } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string | null;
}

const serviceConfigs = {
    Supabase: {
        icon: DatabaseZap,
        color: 'text-green-400',
        fields: [
            { id: 'project-url', label: 'URL do Projeto', placeholder: 'https://seunome.supabase.co' },
            { id: 'anon-key', label: 'Chave Pública (Anon)', placeholder: 'eyJhbGciOiJIUzI1Ni...' },
        ],
    },
    Stripe: {
        icon: CreditCard,
        color: 'text-indigo-400',
        fields: [
            { id: 'publishable-key', label: 'Chave Publicável', placeholder: 'pk_test_...' },
            { id: 'secret-key', label: 'Chave Secreta', placeholder: 'sk_test_...' },
        ],
    },
    Vercel: {
        icon: Triangle,
        color: 'text-white',
        fields: [
            { id: 'project-id', label: 'ID do Projeto', placeholder: 'prj_...' },
            { id: 'auth-token', label: 'Token de Autenticação', placeholder: 'Seu token de API' },
        ],
    },
    GitHub: {
        icon: Github,
        color: 'text-gray-300',
        fields: [
            { id: 'repo-url', label: 'URL do Repositório', placeholder: 'https://github.com/usuario/repo' },
            { id: 'access-token', label: 'Token de Acesso Pessoal', placeholder: 'ghp_...' },
        ],
    },
    Gemini: {
        icon: Cpu,
        color: 'text-purple-400',
        fields: [
            { id: 'gemini-api-key', label: 'Chave de API do Gemini', placeholder: 'AIzaSy...' },
        ],
    },
    OpenAI: {
        icon: Cpu,
        color: 'text-cyan-400',
        fields: [
            { id: 'openai-api-key', label: 'Chave de API da OpenAI', placeholder: 'sk-...' },
        ],
    }
};

const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, serviceName }) => {
  const [formState, setFormState] = useState<{ [key: string]: string }>({});

  const config = useMemo(() => {
    if (!serviceName || !(serviceName in serviceConfigs)) return null;
    return serviceConfigs[serviceName as keyof typeof serviceConfigs];
  }, [serviceName]);

  if (!isOpen || !config) {
    return null;
  }
  
  const Icon = config.icon;

  const handleInputChange = (id: string, value: string) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Saving config for ${serviceName}:`, formState);
    alert(`Configurações para ${serviceName} salvas com sucesso! (Simulado)`);
    onClose();
    setFormState({});
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-6 w-full max-w-lg m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-stone-700 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
            <Icon size={24} className={config.color} />
            <h2 className="text-2xl font-bold text-white">Configurar {serviceName}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {config.fields.map(field => (
                <div key={field.id}>
                    <label htmlFor={field.id} className="text-sm font-medium text-gray-400">{field.label}</label>
                    <Input 
                        id={field.id}
                        type="text"
                        value={formState[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1"
                        required
                    />
                </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
            </Button>
            <Button type="submit" variant="primary">
                Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigModal;