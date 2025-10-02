import React, { useState, useEffect, useRef } from 'react';
import { ExtrasTab, BackgroundStyle, Theme, AchievementName } from '../types';
import { Info, Book, Image, Award, Star, Shield, Archive, Upload, FileText, File as FileIcon, Eye, Trash2 } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import * as dbService from '../services/dbService';

interface ExtrasPanelProps {
  activeTab: ExtrasTab;
  setActiveTab: (tab: ExtrasTab) => void;
  backgroundStyle: BackgroundStyle;
  activeUserTheme: Theme | null;
  onUserThemeChange: (theme: Theme | null) => void;
  activeAchievement: AchievementName | null;
  onAchievementToggle: (achievement: AchievementName) => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-white border-b-2 border-[var(--color-primary)]'
        : 'text-gray-400 hover:text-white'
    }`}
  >
    {label}
  </button>
);

const userThemes: Theme[] = [
  { name: 'red', primary: '#ef4444', primaryHover: '#dc2626', accent: '#f87171' },
  { name: 'orange', primary: '#f97316', primaryHover: '#ea580c', accent: '#fb923c' },
  { name: 'yellow', primary: '#eab308', primaryHover: '#ca8a04', accent: '#fde047' },
  { name: 'lime', primary: '#84cc16', primaryHover: '#65a30d', accent: '#a3e635' },
  { name: 'green', primary: '#22c55e', primaryHover: '#16a34a', accent: '#4ade80' },
  { name: 'teal', primary: '#14b8a6', primaryHover: '#0d9488', accent: '#2dd4bf' },
  { name: 'cyan', primary: '#06b6d4', primaryHover: '#0891b2', accent: '#22d3ee' },
  { name: 'blue', primary: '#3b82f6', primaryHover: '#2563eb', accent: '#60a5fa' },
  { name: 'purple', primary: '#a855f7', primaryHover: '#9333ea', accent: '#c084fc' },
  { name: 'fuchsia', primary: '#d946ef', primaryHover: '#c026d3', accent: '#e879f9' },
  { name: 'pink', primary: '#ec4899', primaryHover: '#db2777', accent: '#f472b6' },
];

const DetailsTab: React.FC<{
  activeUserTheme: Theme | null;
  onUserThemeChange: (theme: Theme | null) => void;
}> = ({ activeUserTheme, onUserThemeChange }) => (
    <div className="p-4 text-sm text-gray-400">
        <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2"><Info size={18}/> Detalhes</h3>
        <p>Clique em um componente no diagrama para ver seus detalhes.</p>
        <p className="mt-4">Nenhum componente selecionado.</p>

        <div className="mt-8 pt-4 border-t border-stone-800">
            <h4 className="font-bold text-base text-white mb-3">Personalize seu Tema</h4>
            <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => onUserThemeChange(null)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${!activeUserTheme ? 'border-white ring-2 ring-white' : 'border-transparent hover:border-white'}`}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-label="Cor Padrão do Tema"
                />
                {userThemes.map(theme => (
                    <button
                        key={theme.name}
                        onClick={() => onUserThemeChange(theme)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${activeUserTheme?.name === theme.name ? 'border-white ring-2 ring-white' : 'border-transparent hover:border-white'}`}
                        style={{ backgroundColor: theme.primary }}
                        aria-label={`Selecionar tema ${theme.name}`}
                    />
                ))}
            </div>
        </div>
    </div>
);

const NotebookTab: React.FC = () => {
    const NOTEBOOK_STORAGE_KEY = 'digital-notebook-note';
    const [note, setNote] = useState('');
    const [files, setFiles] = useState<{ id: number; name: string; type: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const savedNote = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
            if (savedNote) {
                setNote(savedNote);
            }
        } catch (error) {
            console.error("Failed to load note from localStorage:", error);
        }
        
        const loadFiles = async () => {
            setIsLoadingFiles(true);
            try {
                const storedFiles = await dbService.getFilesMeta();
                setFiles(storedFiles);
            } catch (error) {
                console.error("Failed to load files from IndexedDB:", error);
            } finally {
                setIsLoadingFiles(false);
            }
        };
        loadFiles();

    }, []);

    const handleSaveNote = () => {
        try {
            if (note.trim()) {
                localStorage.setItem(NOTEBOOK_STORAGE_KEY, note);
                alert('Anotação salva com sucesso!');
            } else {
                localStorage.removeItem(NOTEBOOK_STORAGE_KEY);
                setNote('');
                alert('Anotação limpa e salva como vazia.');
            }
        } catch (error) {
            console.error("Failed to save note to localStorage:", error);
            alert('Ocorreu um erro ao salvar a anotação.');
        }
    };
    
    const handleAddFileClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await dbService.addFile(file);
                const updatedFiles = await dbService.getFilesMeta();
                setFiles(updatedFiles);
            } catch (error) {
                console.error("Failed to save file to IndexedDB:", error);
                alert('Ocorreu um erro ao salvar o arquivo.');
            }
        }
    };
    
    const handleViewFile = async (id: number) => {
        try {
            const fileBlob = await dbService.getFile(id);
            if (fileBlob) {
                const url = URL.createObjectURL(fileBlob);
                window.open(url, '_blank');
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Failed to view file:", error);
            alert('Não foi possível abrir o arquivo.');
        }
    };
    
    const handleDeleteFile = async (id: number) => {
        if (window.confirm("Tem certeza que deseja apagar este arquivo?")) {
            try {
                await dbService.deleteFile(id);
                setFiles(files.filter(f => f.id !== id));
            } catch (error) {
                console.error("Failed to delete file:", error);
                alert('Ocorreu um erro ao apagar o arquivo.');
            }
        }
    };


    return (
        <div className="p-4 text-sm text-gray-400">
            <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2"><Book size={18}/> Meu Caderno Digital</h3>
            <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-48 bg-stone-800 border-2 border-stone-700 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder="Suas anotações aparecerão aqui..."
            />
            <button 
                onClick={handleSaveNote}
                className="mt-3 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Salvar Anotação
            </button>
            
            <div className="mt-6 pt-4 border-t border-stone-800">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                        <Archive size={18} /> Arquivos Salvos
                    </h4>
                    <button 
                        onClick={handleAddFileClick}
                        className="flex items-center gap-2 text-xs bg-stone-800 hover:bg-stone-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
                    >
                        <Upload size={14} /> Adicionar Arquivo
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.pdf"
                    />
                </div>
                {isLoadingFiles ? (
                    <p>Carregando arquivos...</p>
                ) : files.length === 0 ? (
                    <div className="text-center py-4 px-2 bg-stone-800/50 rounded-lg">
                        <p>Nenhum arquivo salvo.</p>
                        <p className="text-xs opacity-70">Use o botão "Adicionar Arquivo" para começar.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li key={file.id} className="bg-stone-800 p-2 rounded-lg flex items-center justify-between transition-colors hover:bg-stone-700/50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {file.type === 'application/pdf' 
                                        ? <FileText className="text-red-400 flex-shrink-0" size={20} /> 
                                        : <FileIcon className="text-gray-400 flex-shrink-0" size={20} />
                                    }
                                    <span className="text-sm text-gray-300 truncate" title={file.name}>{file.name}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => handleViewFile(file.id)} className="p-1.5 rounded-md hover:bg-stone-700 text-gray-400 hover:text-white" aria-label="Visualizar arquivo">
                                        <Eye size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 rounded-md hover:bg-stone-700 text-gray-400 hover:text-red-400" aria-label="Apagar arquivo">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

const achievements = [
    { id: 'math', name: 'Mestre da Matemática', icon: Award, color: 'text-yellow-500', glowColor: 'shadow-yellow-500/40', ringColor: 'ring-yellow-500' },
    { id: 'space', name: 'Explorador Espacial', icon: Star, color: 'text-blue-400', glowColor: 'shadow-blue-400/40', ringColor: 'ring-blue-400' },
    { id: 'history', name: 'Historiador Nato', icon: Shield, color: 'text-green-400', glowColor: 'shadow-green-400/40', ringColor: 'ring-green-400' },
    { id: 'grammar', name: 'Gênio da Gramática', icon: Book, color: 'text-red-400', glowColor: 'shadow-red-400/40', ringColor: 'ring-red-400' },
];

const AlbumTab: React.FC<{
  onToggle: (achievement: AchievementName) => void;
  active: AchievementName | null;
}> = ({ onToggle, active }) => (
    <div className="p-4 text-sm text-gray-400">
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2"><Image size={18}/> Álbum de Conquistas</h3>
        <p className="mb-4">Ative uma conquista para dar um super-poder à IA!</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            {achievements.map((ach) => {
                const isActive = active === ach.id;
                return (
                    <button
                        key={ach.id}
                        onClick={() => onToggle(ach.id as AchievementName)}
                        className={`flex flex-col items-center p-3 bg-stone-800 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                            isActive
                                ? `opacity-100 ring-2 ${ach.ringColor} shadow-lg ${ach.glowColor}`
                                : 'opacity-60 hover:opacity-100'
                        }`}
                        aria-pressed={isActive}
                    >
                        <ach.icon size={32} className={`${ach.color} mb-1`} />
                        <span className="text-xs font-medium text-gray-200">{ach.name}</span>
                    </button>
                );
            })}
        </div>
    </div>
);


const ExtrasPanel: React.FC<ExtrasPanelProps> = ({ activeTab, setActiveTab, backgroundStyle, activeUserTheme, onUserThemeChange, activeAchievement, onAchievementToggle }) => {
  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-black">
      <AnimatedBackground style={backgroundStyle} />
      <div className="flex-shrink-0 border-b border-stone-800 z-10">
        <nav className="flex">
          <TabButton label="Detalhes" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
          <TabButton label="Caderno" isActive={activeTab === 'notebook'} onClick={() => setActiveTab('notebook')} />
          <TabButton label="Álbum" isActive={activeTab === 'album'} onClick={() => setActiveTab('album')} />
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto z-10">
        {activeTab === 'details' && <DetailsTab activeUserTheme={activeUserTheme} onUserThemeChange={onUserThemeChange} />}
        {activeTab === 'notebook' && <NotebookTab />}
        {activeTab === 'album' && <AlbumTab onToggle={onAchievementToggle} active={activeAchievement} />}
      </div>
    </div>
  );
};

export default ExtrasPanel;