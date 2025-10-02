import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageSender, EducationLevel } from '../types';
import { Send, Bot, User, Wand2, Plus, Image, FileText, File as FileIcon, Film, Globe, Mic } from 'lucide-react';
import SubjectSelector from './SubjectSelector';
import { AiVoice } from '../App';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';

// Assume que process.env.API_KEY está configurado no ambiente de execução.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendAttachment: (file: File) => void;
  isLoading: boolean;
  educationLevel: EducationLevel;
  aiVoice: AiVoice;
}

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const renderAttachment = () => {
    if (!message.attachment) return null;

    const { dataUrl, name, mimeType } = message.attachment;

    if (mimeType.startsWith('image/')) {
      return <img src={dataUrl} alt={name} className="mt-2 rounded-lg max-w-full h-auto" style={{ maxHeight: '200px' }} />;
    }

    let Icon = FileText;
    if (mimeType === 'application/pdf') Icon = FileIcon;
    
    return (
        <div className="mt-2 bg-stone-700/50 p-2 rounded-lg flex items-center gap-2">
            <Icon size={24} className="text-[var(--color-accent)] flex-shrink-0" />
            <span className="text-sm text-gray-300 truncate">{name}</span>
        </div>
    );
  };
  
  const renderGrounding = () => {
    if (!message.grounding || message.grounding.length === 0) return null;
    
    return (
      <div className="mt-3 pt-2 border-t border-stone-700/50">
        <h4 className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1.5">
          <Globe size={12} />
          Fontes da Web
        </h4>
        <div className="flex flex-wrap gap-2">
          {message.grounding.map((source, index) => (
            <a 
              key={index}
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs bg-stone-700/80 hover:bg-stone-700 text-gray-300 px-2 py-1 rounded-full transition-colors"
            >
              {source.title}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
          <Bot size={20} className="text-white" />
        </div>
      )}
      <div 
        className={`max-w-xs md:max-w-md p-3 rounded-lg ${isUser ? 'bg-[var(--color-primary)] text-white rounded-br-none' : 'bg-stone-800 text-gray-300 rounded-bl-none'}`}
      >
        {message.text && <p className="text-sm whitespace-pre-wrap">{message.text}</p>}
        {renderAttachment()}
        {renderGrounding()}
        <p className={`text-xs text-right opacity-60 ${message.text || message.attachment || message.grounding ? 'mt-1' : ''}`}>{message.timestamp}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
};

// --- Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
// --- End Audio Helper Functions ---


const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onSendAttachment, isLoading, educationLevel, aiVoice }) => {
  const [inputText, setInputText] = useState('');
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [attachmentMenuRef]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };
  
  const handleAttachmentClick = (accept: string) => {
    if (fileInputRef.current) {
        fileInputRef.current.accept = accept;
        fileInputRef.current.click();
    }
    setIsAttachmentMenuOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        onSendAttachment(file);
    }
    e.target.value = '';
  };

  const quickAction = (text: string) => {
    onSendMessage(text);
  };
  
  const stopLiveSession = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (inputAudioContextRef.current) {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsSessionActive(false);
  };

  const startLiveSession = async () => {
    setIsSessionActive(true);
    try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

        // FIX: Cast window to `any` to support `webkitAudioContext` for older Safari browsers without causing a TypeScript error.
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        nextStartTimeRef.current = 0;
        const outputNode = outputAudioContextRef.current.createGain();
        
        const systemInstruction = `Você é a "Writer University AI", uma inteligência artificial assistente e tutora para reforço escolar. Sua missão é conversar com crianças e adolescentes de forma amigável, paciente e encorajadora, usando uma linguagem simples e natural. Aja como uma amiga professora. Mantenha as respostas curtas e focadas no aprendizado.`;
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                    scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessorRef.current);
                    scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64EncodedAudioString) {
                        const outputCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                    if (message.serverContent?.interrupted) {
                        for (const source of audioSourcesRef.current.values()) {
                            source.stop();
                        }
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    stopLiveSession();
                },
                onclose: (e: CloseEvent) => {
                    stopLiveSession();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: aiVoice } },
                },
                systemInstruction: systemInstruction,
            },
        });
    } catch (err) {
        console.error("Failed to start live session:", err);
        alert("Não foi possível acessar o microfone. Verifique as permissões do seu navegador.");
        setIsSessionActive(false);
    }
  };
  
  const toggleLiveSession = () => {
    if (isSessionActive) {
      stopLiveSession();
    } else {
      startLiveSession();
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (isSessionActive) {
            stopLiveSession();
        }
    };
  }, [isSessionActive]);


  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <h2 className="text-lg font-bold text-gray-100 mb-4 border-b border-stone-800 pb-2 hidden md:block">
        {educationLevel}
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex items-start gap-3 my-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Bot size={20} className="text-white" />
                </div>
                <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-stone-800 text-gray-300 rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4 border-t border-stone-800 pt-4">
        <div className="flex gap-2 mb-2 items-center">
            <SubjectSelector onSelect={onSendMessage} />
            <button onClick={() => quickAction("Faça um resumo sobre o sistema solar")} className="flex items-center gap-1 text-xs bg-stone-800 hover:bg-stone-700 text-gray-300 px-2 py-1 rounded-full transition-colors"><Wand2 size={12} className="text-[var(--color-accent)]"/> Fazer Resumo</button>
        </div>
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            }}
            placeholder={isSessionActive ? "Ouvindo... Fale com a IA!" : "Ex: 'Um aplicativo de rede social...'"}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 pl-12 pr-24 text-sm text-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-colors resize-none disabled:bg-stone-800/50"
            rows={2}
            disabled={isSessionActive}
          />
          <div ref={attachmentMenuRef} className="absolute left-3 top-4">
            <button 
                type="button" 
                onClick={() => setIsAttachmentMenuOpen(prev => !prev)} 
                className="p-2 rounded-full text-gray-400 hover:bg-stone-700 hover:text-white transition-colors disabled:opacity-50"
                aria-label="Anexar arquivo"
                disabled={isSessionActive}
            >
                <Plus size={18} />
            </button>
            {isAttachmentMenuOpen && (
                <div className="absolute bottom-full mb-2 w-60 bg-stone-900 border border-stone-700 rounded-lg shadow-2xl p-2 z-20 animate-fade-in-up">
                    <button onClick={() => handleAttachmentClick('image/png,image/jpeg,image/webp')} className="w-full text-left text-sm p-2 rounded-md hover:bg-stone-800 transition-colors flex items-center gap-3"><Image size={16} className="text-blue-400"/> Carregar Imagem</button>
                    <button onClick={() => handleAttachmentClick('text/plain')} className="w-full text-left text-sm p-2 rounded-md hover:bg-stone-800 transition-colors flex items-center gap-3"><FileText size={16} className="text-green-400"/> Carregar Arquivo de Texto</button>
                    <button onClick={() => handleAttachmentClick('application/pdf')} className="w-full text-left text-sm p-2 rounded-md hover:bg-stone-800 transition-colors flex items-center gap-3"><FileIcon size={16} className="text-red-400"/> Carregar PDF</button>
                    <button onClick={() => handleAttachmentClick('image/gif')} className="w-full text-left text-sm p-2 rounded-md hover:bg-stone-800 transition-colors flex items-center gap-3"><Film size={16} className="text-purple-400"/> Carregar GIF</button>
                </div>
            )}
          </div>
          <div className="absolute right-3 top-4 flex items-center gap-2">
            <button 
                type="button" 
                onClick={toggleLiveSession} 
                className={`p-2 rounded-full transition-colors ${isSessionActive ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-stone-700 hover:bg-stone-600 text-gray-300'}`}
                aria-label={isSessionActive ? "Encerrar conversa por voz" : "Iniciar conversa por voz"}
            >
                <Mic size={16} />
            </button>
            <button type="submit" disabled={isLoading || !inputText.trim() || isSessionActive} className="p-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white disabled:bg-stone-600 disabled:cursor-not-allowed transition-colors">
                <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;