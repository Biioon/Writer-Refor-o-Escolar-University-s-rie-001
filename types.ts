export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Attachment {
  dataUrl: string;
  name: string;
  mimeType: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  type?: 'system';
  attachment?: Attachment;
  grounding?: GroundingSource[];
}

export type StudioView = 'default' | 'calculator' | 'map' | 'ebook';
export type ExtrasTab = 'details' | 'notebook' | 'album';
export type BackgroundStyle = 'particles' | 'bubbles' | 'neon_rain' | 'falling_leaves';

export type ThemeName = 'default' | 'forest' | 'ocean' | 'sunset' | 'blossom';

export interface Theme {
  name?: string;
  primary: string;
  primaryHover: string;
  accent: string;
}

export type AchievementName = 'math' | 'space' | 'history' | 'grammar';
export type EducationLevel = 'Ensino Fundamental' | 'Ensino Médio';
export type AdminView = 'home' | 'chat_ai' | 'notebook' | 'library' | 'projects' | 'statistics';