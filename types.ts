export interface CharacterStats {
  gender: string; // 'Nam' | 'Nữ'
  height: string;
  bust: string;
  waist: string;
  hip: string;
  age: string;
  skinTone: string;
  build: string; // e.g., Slim, Muscular
}

export interface CharacterAppearance {
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothingStyle: string;
  accessories: string;
}

export interface Item {
  id: string;
  name: string;
  type: string; // 'Vũ khí', 'Pháp bảo', 'Đan dược', 'Thú cưỡi'
  description: string;
  imageUrl: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Base64 or URL
  stats?: CharacterStats;
  appearance?: CharacterAppearance;
  items?: Item[]; // Inventory
}

export interface ComicPanel {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export type ViewState = 'home' | 'characters' | 'gallery' | 'create-character' | 'settings' | 'character-detail' | 'create-item';

export interface GenerationConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9";
}

export interface BackupData {
  characters: Character[];
  panels: ComicPanel[];
  timestamp: number;
  version: string;
}