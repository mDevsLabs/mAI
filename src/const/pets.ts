export type PetId =
  | 'apupepe'
  | 'claude-pixel'
  | 'codix'
  | 'dario'
  | 'gork'
  | 'laughing-gemini'
  | 'mini-elon'
  | 'mini-sama'
  | 'problem';

export type PetCategory = 'Mascot' | 'Human' | 'Robot' | 'Alien' | 'Animal';

export interface PetConfig {
  id: PetId;
  name: string;
  description: string;
  category: PetCategory;
}

export const PETS_LIST: PetConfig[] = [
  { id: 'apupepe', name: 'Apu Pepe', description: 'Le petit Pepe toujours prêt à aider.', category: 'Animal' },
  { id: 'claude-pixel', name: 'Claude Pixel', description: 'Un petit Claude tout mignon en pixel art.', category: 'Mascot' },
  { id: 'codix', name: 'Codix', description: 'Votre assistant robotique pour le code.', category: 'Robot' },
  { id: 'dario', name: 'Dario', description: 'Dario le développeur dévoué.', category: 'Human' },
  { id: 'gork', name: 'Gork', description: 'Un extra-terrestre amical.', category: 'Alien' },
  { id: 'laughing-gemini', name: 'Gemini', description: 'Gemini, toujours souriant et intelligent.', category: 'Mascot' },
  { id: 'mini-elon', name: 'Mini Elon', description: 'Un visionnaire miniature dans votre interface.', category: 'Human' },
  { id: 'mini-sama', name: 'Mini Sama', description: 'Le petit Sama respectueux.', category: 'Human' },
  { id: 'problem', name: 'Problem', description: 'Un compagnon pour vous aider avec vos problèmes.', category: 'Mascot' },
];

