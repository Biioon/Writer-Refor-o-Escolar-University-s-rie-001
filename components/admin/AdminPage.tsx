import React, { useState } from 'react';
import { Home, MessageSquare, BookOpen, Library, FolderKanban, BarChart2, Settings, UserCircle, Calendar, ListChecks, PieChart, Clock, Mail, Bell, Search, LogOut, Info, GraduationCap, X, AlertTriangle, Paintbrush, Check, Cpu, Trash2, Edit, PlusCircle, BookCopy, Mic } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import { Toggle } from './ui/Toggle';
import { Modal } from './ui/Modal';
import { Dropdown } from './ui/Dropdown';
import { Popover } from './ui/Popover';
import { ThemeName, EducationLevel, AdminView } from '../../types';
import ConfigModal from './ConfigModal';
import { AiVoice } from '../../App';

interface AdminPageProps {
  onExitAdmin: () => void;
  onThemeChange: (theme: ThemeName) => void;
  currentTheme: ThemeName;
  educationLevel: EducationLevel;
  onEducationLevelChange: (level: EducationLevel) => void;
  aiVoice: AiVoice;
  onAiVoiceChange: (voice: AiVoice) => void;
}

const PlaceholderView: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
      <Icon className="text-purple-400" />
      <span>{title}</span>
    </h1>
    <p className="mt-2 text-gray-400">{children}</p>
  </div>
);

const aiVoices: { id: AiVoice; name: string }[] = [
    { id: 'Zephyr', name: 'Zephyr (Padrão)' },
    { id: 'Puck', name: 'Puck' },
    { id: 'Charon', name: 'Charon' },
    { id: 'Kore', name: 'Kore' },
    { id: 'Fenrir', name: 'Fenrir' },
];

interface Integration {
    id: string;
    name: string;
    description: string;
    Icon: React.ElementType;
    isCustom?: boolean;
}

const initialIntegrations: Integration[] = [
    {
        id: 'gemini',
        name: 'Gemini',
        description: 'Modelo de linguagem da Google.',
        Icon: () => <img src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" alt="Google" className="h-6"/>,
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'Modelos GPT, incluindo GPT-4.',
        Icon: () => <svg className="h-6 w-6 text-white" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512s512-229.2 512-512S794.8 0 512 0zm283.3 535.8l-116.2 67.1l-24.6-42.6l116.2-67.1c6.6-3.8 8.9-12.5 5.1-19.1s-12.5-8.9-19.1-5.1l-116.2 67.1l-91.6-158.6l91.6-52.9c6.6-3.8 8.9-12.5 5.1-19.1s-12.5-8.9-19.1-5.1l-91.6 52.9l-24.6-42.6l91.6-52.9c6.6-3.8 8.9-12.5 5.1-19.1s-12.5-8.9-19.1-5.1l-116.2 67.1V283.3c0-7.3-5.9-13.2-13.2-13.2s-13.2 5.9-13.2 13.2v116.2l-116.2-67.1c-6.6-3.8-15.2-1.6-19.1 5.1s-1.6 15.2 5.1 19.1l91.6 52.9l-24.6 42.6l-91.6-52.9c-6.6-3.8-15.2-1.6-19.1 5.1s-1.6 15.2 5.1 19.1l91.6 52.9l-91.6 158.6l116.2-67.1c6.6-3.8 15.2-1.6 19.1 5.1s1.6 15.2-5.1 19.1l-116.2 67.1l24.6 42.6l116.2-67.1c6.6-3.8 15.2-1.6 19.1 5.1s1.6 15.2-5.1 19.1L420.1 740.7V624.5c0-7.3-5.9-13.2-13.2-13.2s-13.2 5.9-13.2 13.2v116.2l-116.2 67.1c-6.6 3.8-8.9 12.5-5.1 19.1c2.8 4.8 7.8 7.4 12.8 7.4c2 0 4-0.5 5.9-1.5l116.2-67.1l91.6 158.6l-91.6 52.9c-6.6 3.8-8.9 12.5-5.1 19.1c2.8 4.8 7.8 7.4 12.8 7.4c2 0 4-0.5 5.9-1.5l91.6-52.9l24.6 42.6l-91.6 52.9c-6.6 3.8-8.9 12.5-5.1 19.1c2.8 4.8 7.8 7.4 12.8 7.4c2 0 4-0.5 5.9-1.5l116.2-67.1V795c0 7.3 5.9 13.2 13.2 13.2s13.2-5.9 13.2-13.2V678.8l116.2 67.1c2 1.1 4 1.5 5.9 1.5c5 0 10-2.6 12.8-7.4c3.8-6.6 1.6-15.2-5.1-19.1l-116.2-67.1l24.6-42.6l116.2 67.1c2 1.1 4 1.5 5.9 1.5c5 0 10-2.6 12.8-7.4c3.8-6.6 1.6-15.2-5.1-19.1zM512 554.6c-23.5 0-42.6-19.1-42.6-42.6s19.1-42.6 42.6-42.6s42.6 19.1 42.6 42.6s-19.1 42.6-42.6 42.6z"></path></svg>,
    },
];

const ChatAIIntegrations: React.FC<{ 
    onOpenConfig: (service: string) => void;
    aiVoice: AiVoice;
    onAiVoiceChange: (voice: AiVoice) => void;
}> = ({ onOpenConfig, aiVoice, onAiVoiceChange }) => {
    const [integrations, setIntegrations] = useState(
        initialIntegrations.map(int => ({ ...int, status: int.id === 'gemini' }))
    );
    const [newIntegrationUrl, setNewIntegrationUrl] = useState('');

    const handleToggleStatus = (id: string) => {
        setIntegrations(prev =>
            prev.map(int => (int.id === id ? { ...int, status: !int.status } : int))
        );
    };
    
    const handleDeleteIntegration = (id: string) => {
        if (window.confirm("Tem certeza que deseja remover esta integração?")) {
            setIntegrations(prev => prev.filter(int => int.id !== id));
        }
    };

    const urlToName = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            const name = hostname.replace(/^(www\.|api\.)/, '').split('.')[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        } catch (e) {
            return "Integração";
        }
    };
    
    const handleAddIntegration = () => {
        if (!newIntegrationUrl.trim()) {
            alert("Por favor, insira uma URL válida.");
            return;
        }
        const newIntegration: Integration & { status: boolean } = {
            id: `custom-${Date.now()}`,
            name: urlToName(newIntegrationUrl),
            description: 'Integração customizada via URL.',
            Icon: Cpu,
            isCustom: true,
            status: true,
        };
        setIntegrations(prev => [...prev, newIntegration]);
        setNewIntegrationUrl('');
    };

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2"><Cpu className="text-purple-400"/>Hub de Integração de IAs</h1>
            <p className="text-gray-400 mb-8">Ative, desative e configure os modelos de IA que alimentam a aplicação.</p>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Mic className="text-purple-400" />Configuração da Conversa ao Vivo</CardTitle>
                    <CardDescription>Escolha a voz que a IA usará nas interações de áudio em tempo real.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                    {aiVoices.map(voice => (
                         <Button 
                            key={voice.id}
                            onClick={() => onAiVoiceChange(voice.id)}
                            variant={aiVoice === voice.id ? 'primary' : 'secondary'}
                            size="sm"
                        >
                            {aiVoice === voice.id && <Check size={16} className="mr-2"/>}
                            {voice.name}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Adicionar Nova Integração</CardTitle>
                    <CardDescription>Adicione um novo provedor de IA a partir da URL da API.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            type="url"
                            placeholder="https://api.provedor.com"
                            value={newIntegrationUrl}
                            onChange={(e) => setNewIntegrationUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddIntegration();
                            }}
                        />
                        <Button variant="primary" onClick={handleAddIntegration} className="flex-shrink-0">
                            <PlusCircle size={16} className="mr-2"/>
                            Adicionar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map(({ id, name, description, Icon, status, isCustom }) => (
                     <Card key={id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Icon />
                                    <span>{name}</span>
                                </span>
                                {isCustom && (
                                    <Button variant="icon" size="sm" onClick={() => handleDeleteIntegration(id)} aria-label="Remover integração">
                                        <Trash2 size={14} className="text-gray-400 hover:text-red-400"/>
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className={`text-sm font-medium ${status ? 'text-green-400' : 'text-gray-500'}`}>{status ? 'Ativo' : 'Inativo'}</div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" onClick={() => onOpenConfig(name)}>Configurar</Button>
                                <Toggle enabled={status} onToggle={() => handleToggleStatus(id)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const LibraryManagement = () => (
    <div>
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"><Library className="text-purple-400"/>Gerenciamento da Biblioteca</h1>
                <p className="mt-2 text-gray-400">Adicione, edite ou remova materiais de estudo.</p>
            </div>
            <Button variant="primary">
                <PlusCircle size={16} className="mr-2"/>
                Adicionar Novo Livro
            </Button>
        </div>
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-stone-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Título</th>
                            <th scope="col" className="px-6 py-3">Autor</th>
                            <th scope="col" className="px-6 py-3">Data de Adição</th>
                            <th scope="col" className="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-stone-700 hover:bg-stone-800">
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">Aventuras no Sistema Solar</td>
                            <td className="px-6 py-4">Dr. Astro</td>
                            <td className="px-6 py-4">2023-10-26</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <Button variant="icon" size="sm"><Edit size={14}/></Button>
                                <Button variant="icon" size="sm"><Trash2 size={14}/></Button>
                            </td>
                        </tr>
                        <tr className="border-b border-stone-700 hover:bg-stone-800">
                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">O Mundo dos Mapas</td>
                            <td className="px-6 py-4">Geo Plannet</td>
                            <td className="px-6 py-4">2023-09-15</td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <Button variant="icon" size="sm"><Edit size={14}/></Button>
                                <Button variant="icon" size="sm"><Trash2 size={14}/></Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);


const HomeView: React.FC<Omit<AdminPageProps, 'aiVoice' | 'onAiVoiceChange'>> = (props) => (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard UI Kit</h1>
        <p className="mt-2 text-gray-400">Componentes reutilizáveis para a aplicação "Writer Refoço Escolar".</p>
      </div>
      <section>
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Configurações Gerais</h2>
        <Card>
            <CardHeader>
                <CardTitle>Nível de Ensino</CardTitle>
                <CardDescription>
                    Altere o título principal do chat para refletir o público-alvo.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
                <Button 
                    onClick={() => props.onEducationLevelChange('Ensino Fundamental')}
                    variant={props.educationLevel === 'Ensino Fundamental' ? 'primary' : 'secondary'}
                >
                    Ensino Fundamental
                </Button>
                <Button 
                    onClick={() => props.onEducationLevelChange('Ensino Médio')}
                    variant={props.educationLevel === 'Ensino Médio' ? 'primary' : 'secondary'}
                >
                    Ensino Médio
                </Button>
            </CardContent>
        </Card>
      </section>
      <section>
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Personalização de Tema</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Paintbrush className="text-purple-400" /><span>Seletor de Cores</span></CardTitle>
            <CardDescription>Clique em uma paleta para alterar o tema da aplicação principal em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {themeOptions.map(theme => (
                  <button key={theme.name} onClick={() => props.onThemeChange(theme.name)} className={`p-4 rounded-lg border-2 transition-all ${props.currentTheme === theme.name ? 'border-purple-500 ring-2 ring-purple-500' : 'border-stone-700 hover:border-stone-500'}`}>
                      <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-white">{theme.label}</h4>
                          {props.currentTheme === theme.name && <Check size={20} className="text-purple-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                          <div className="w-8 h-8 rounded-full bg-stone-700"></div>
                      </div>
                  </button>
              ))}
          </CardContent>
        </Card>
      </section>
    </div>
);


const themeOptions: { name: ThemeName, label: string, colors: { primary: string, accent: string } }[] = [
    { name: 'default', label: 'Padrão (Roxo)', colors: { primary: '#7c3aed', accent: '#a78bfa' } },
    { name: 'forest', label: 'Floresta (Verde)', colors: { primary: '#16a34a', accent: '#4ade80' } },
    { name: 'ocean', label: 'Oceano (Azul)', colors: { primary: '#2563eb', accent: '#60a5fa' } },
    { name: 'sunset', label: 'Entardecer (Laranja)', colors: { primary: '#ea580c', accent: '#fb923c' } },
    { name: 'blossom', label: 'Florescer (Rosa)', colors: { primary: '#ec4899', accent: '#f9a8d4' } },
];

const AdminPage: React.FC<AdminPageProps> = ({ onExitAdmin, onThemeChange, currentTheme, educationLevel, onEducationLevelChange, aiVoice, onAiVoiceChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', type: 'success' as 'success' | 'error' | 'warning' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [configService, setConfigService] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AdminView>('home');


  const openModal = (title: string, type: 'success' | 'error' | 'warning') => {
    setModalContent({ title, type });
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (activeView) {
        case 'chat_ai':
            return <ChatAIIntegrations onOpenConfig={setConfigService} aiVoice={aiVoice} onAiVoiceChange={onAiVoiceChange} />;
        case 'library':
            return <LibraryManagement />;
        case 'notebook':
            return <PlaceholderView title="Gerenciamento de Cadernos" icon={BookCopy}>Esta seção exibirá e permitirá gerenciar as anotações dos alunos.</PlaceholderView>;
        case 'projects':
            return <PlaceholderView title="Projetos dos Alunos" icon={FolderKanban}>Aqui você poderá visualizar e avaliar os projetos submetidos pelos alunos.</PlaceholderView>;
        case 'statistics':
            return <PlaceholderView title="Estatísticas de Engajamento" icon={BarChart2}>Gráficos e métricas sobre o uso da plataforma e progresso dos alunos aparecerão aqui.</PlaceholderView>;
        case 'home':
        default:
            return <HomeView 
                        onExitAdmin={onExitAdmin} 
                        onThemeChange={onThemeChange} 
                        currentTheme={currentTheme} 
                        educationLevel={educationLevel} 
                        onEducationLevelChange={onEducationLevelChange} 
                    />;
    }
  };


  return (
    <div className="flex h-screen bg-stone-900 text-gray-300 font-sans">
      <AdminSidebar 
        onExitAdmin={onExitAdmin}
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenConfigModal={setConfigService}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-950">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        <footer className="p-4 border-t border-stone-800 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Writer Refoço Escolar University. Todos os direitos reservados.
        </footer>

         <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={modalContent.title}
          type={modalContent.type}
        >
          <p className="text-sm text-gray-400">
            {modalContent.type === 'success' && 'Sua ação foi completada com sucesso.'}
            {modalContent.type === 'error' && 'Não foi possível completar a ação. Tente novamente.'}
            {modalContent.type === 'warning' && 'Esta ação não pode ser desfeita. Por favor, confirme sua escolha.'}
          </p>
        </Modal>

        <ConfigModal
          isOpen={!!configService}
          onClose={() => setConfigService(null)}
          serviceName={configService}
        />

      </div>
    </div>
  );
};

export default AdminPage;