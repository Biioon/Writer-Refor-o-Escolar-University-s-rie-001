import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Message, MessageSender, StudioView, ExtrasTab, BackgroundStyle, ThemeName, Theme, AchievementName, Attachment, EducationLevel } from './types';
import Header from './components/Header';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import ExtrasPanel from './components/ExtrasPanel';
import LoginModal from './components/LoginModal';
import { getGeminiResponse } from './services/geminiService';
import AdminPage from './components/admin/AdminPage';
import { MessageSquare, Eye, List } from 'lucide-react';

const themes: Record<ThemeName, Theme> = {
  default: { primary: '#7c3aed', primaryHover: '#6d28d9', accent: '#a78bfa' },
  forest: { primary: '#16a34a', primaryHover: '#15803d', accent: '#4ade80' },
  ocean: { primary: '#2563eb', primaryHover: '#1d4ed8', accent: '#60a5fa' },
  sunset: { primary: '#ea580c', primaryHover: '#c2410c', accent: '#fb923c' },
  blossom: { primary: '#ec4899', primaryHover: '#db2777', accent: '#f9a8d4' },
};

export type AiVoice = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou a IA de reforço escolar da Writer University. Descreva o que você quer aprender e eu criarei uma experiência completa para você.',
      sender: MessageSender.AI,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [currentStudioView, setCurrentStudioView] = useState<StudioView>('default');
  const [activeExtrasTab, setActiveExtrasTab] = useState<ExtrasTab>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<BackgroundStyle>('particles');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [view, setView] = useState<'app' | 'admin'>('app');
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'studio' | 'extras'>('chat');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');
  const [userTheme, setUserTheme] = useState<Theme | null>(null);
  const [activeAchievement, setActiveAchievement] = useState<AchievementName | null>(null);
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('Ensino Fundamental');
  const [aiVoice, setAiVoice] = useState<AiVoice>('Zephyr');


  const [panelWidths, setPanelWidths] = useState({ left: 25, right: 25 });
  const resizingPanelRef = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    // User theme takes precedence over admin-set theme
    const activeTheme = userTheme || themes[currentTheme];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', activeTheme.primary);
    root.style.setProperty('--color-primary-hover', activeTheme.primaryHover);
    root.style.setProperty('--color-accent', activeTheme.accent);
  }, [currentTheme, userTheme]);
  
  // Reset user theme when admin changes the base theme
  useEffect(() => {
    setUserTheme(null);
  }, [currentTheme]);

  useEffect(() => {
    const checkScreenSize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAchievementToggle = useCallback((achievement: AchievementName) => {
    const newActiveAchievement = activeAchievement === achievement ? null : achievement;
    setActiveAchievement(newActiveAchievement);

    let confirmationText = 'Poderes desativados. Voltando ao modo normal.';
    if (newActiveAchievement) {
      switch (newActiveAchievement) {
        case 'math':
          confirmationText = 'Modo Mestre da Matemática ativado! ⚡️ Estou pronto para resolver qualquer problema!';
          break;
        case 'space':
          confirmationText = 'Modo Explorador Espacial ativado! 🚀 Vamos viajar pelas estrelas!';
          break;
        case 'history':
          confirmationText = 'Modo Historiador Nato ativado! 📜 Qual evento do passado vamos revisitar?';
          break;
        case 'grammar':
          confirmationText = 'Modo Gênio da Gramática ativado! ✍️ Nenhuma regra de português escapará de nós!';
          break;
      }
    }
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: confirmationText,
      sender: MessageSender.AI,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
    };
    setMessages(prev => [...prev.filter(msg => msg.type !== 'system'), aiMessage]);

  }, [activeAchievement]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: MessageSender.USER,
      timestamp,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await getGeminiResponse(text, activeAchievement);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounding: aiResponse.grounding,
      };

      setMessages(prev => [...prev, aiMessage]);

      if (aiResponse.action?.type === 'setView' && aiResponse.action.view) {
        setCurrentStudioView(aiResponse.action.view);
      }
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [activeAchievement]);

  const handleSendAttachment = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const attachment: Attachment = {
          dataUrl,
          name: file.name,
          mimeType: file.type,
        };

        const message: Message = {
          id: Date.now().toString(),
          text: '',
          sender: MessageSender.USER,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachment,
        };

        setMessages(prev => [...prev, message]);
        
        // Simulate AI response to attachment
        setIsLoading(true);
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: `Recebi seu arquivo "${file.name}"! O que você gostaria que eu analisasse ou fizesse com ele?`,
                sender: MessageSender.AI,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 1200);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleMouseDown = (panel: 'left' | 'right') => (e: React.MouseEvent) => {
    if (!isDesktop) return;
    e.preventDefault();
    resizingPanelRef.current = panel;
    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingPanelRef.current) return;

    const windowWidth = window.innerWidth;
    
    if (resizingPanelRef.current === 'left') {
      const newLeftWidth = (e.clientX / windowWidth) * 100;
      const clampedWidth = Math.max(15, Math.min(newLeftWidth, 50)); 
      setPanelWidths(prev => ({ ...prev, left: clampedWidth }));
    } else if (resizingPanelRef.current === 'right') {
      const newRightWidth = ((windowWidth - e.clientX) / windowWidth) * 100;
      const clampedWidth = Math.max(15, Math.min(newRightWidth, 50));
      setPanelWidths(prev => ({ ...prev, right: clampedWidth }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    resizingPanelRef.current = null;
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (view === 'admin') {
    return <AdminPage 
      onExitAdmin={() => setView('app')} 
      onThemeChange={setCurrentTheme} 
      currentTheme={currentTheme}
      educationLevel={educationLevel}
      onEducationLevelChange={setEducationLevel}
      aiVoice={aiVoice}
      onAiVoiceChange={setAiVoice}
    />;
  }

  const mobileTabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'studio', label: 'Preview', icon: Eye },
    { id: 'extras', label: 'Detalhes', icon: List },
  ];

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-gray-200 font-sans select-none">
      <Header 
        currentBackground={currentBackground} 
        setCurrentBackground={setCurrentBackground} 
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onNavigateToAdmin={() => setView('admin')}
      />
      
      {/* Mobile Tab Bar */}
      <div className="md:hidden flex-shrink-0 border-b border-stone-800 bg-stone-900 z-10">
        <nav className="flex justify-around">
          {mobileTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveMobileTab(id as 'chat' | 'studio' | 'extras')}
              className={`w-full py-3 text-sm font-medium flex flex-col items-center gap-1 transition-colors ${
                activeMobileTab === id
                  ? 'text-white bg-purple-600/20 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:bg-stone-800'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Panel */}
        <div 
          className={`
            ${activeMobileTab === 'chat' ? 'flex' : 'hidden'} md:!flex flex-col w-full md:w-auto 
            overflow-hidden bg-stone-900/80 backdrop-blur-sm md:border-r md:border-stone-800
          `}
          style={isDesktop ? { width: `${panelWidths.left}%` } : {}}
        >
          <ChatPanel 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onSendAttachment={handleSendAttachment}
            isLoading={isLoading} 
            educationLevel={educationLevel}
            aiVoice={aiVoice}
          />
        </div>

        {/* Left Resizer */}
        <div 
          onMouseDown={handleMouseDown('left')}
          className="w-1.5 cursor-col-resize bg-stone-800/50 hover:bg-[var(--color-primary)] transition-colors duration-200 flex-shrink-0 hidden md:block"
          aria-label="Redimensionar painel de chat"
          role="separator"
        />

        {/* Middle Panel */}
        <div className={`
          ${activeMobileTab === 'studio' ? 'flex' : 'hidden'} md:!flex 
          flex-1 flex-col relative min-w-0
        `}>
          <StudioPanel currentView={currentStudioView} backgroundStyle={currentBackground} />
        </div>

        {/* Right Resizer */}
        <div 
          onMouseDown={handleMouseDown('right')}
          className="w-1.5 cursor-col-resize bg-stone-800/50 hover:bg-[var(--color-primary)] transition-colors duration-200 flex-shrink-0 hidden md:block"
          aria-label="Redimensionar painel de extras"
          role="separator"
        />

        {/* Right Panel */}
        <div 
          className={`
            ${activeMobileTab === 'extras' ? 'flex' : 'hidden'} md:!flex flex-col w-full md:w-auto
            overflow-hidden bg-stone-900/80 backdrop-blur-sm md:border-l md:border-stone-800
          `}
          style={isDesktop ? { width: `${panelWidths.right}%` } : {}}
        >
          <ExtrasPanel 
            activeTab={activeExtrasTab} 
            setActiveTab={setActiveExtrasTab} 
            backgroundStyle={currentBackground}
            activeUserTheme={userTheme}
            onUserThemeChange={setUserTheme}
            activeAchievement={activeAchievement}
            onAchievementToggle={handleAchievementToggle}
          />
        </div>
      </main>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default App;