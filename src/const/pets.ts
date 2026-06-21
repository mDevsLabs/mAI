export type PetId =
  | 'apupepe'
  | 'bytepilot'
  | 'chibi-rilakkuma'
  | 'claude-pixel'
  | 'clerkhausen'
  | 'codix'
  | 'dario'
  | 'doxi'
  | 'dudu-bubu'
  | 'einstein'
  | 'gork'
  | 'gugu'
  | 'helmet-bunny'
  | 'jiji'
  | 'laughing-gemini'
  | 'mini-elon'
  | 'mini-sama'
  | 'maomao-the-cat'
  | 'mr-poopybutthole'
  | 'pingu'
  | 'plum-tang'
  | 'problem'
  | 'quillfox'
  | 'red'
  | 'tibo'
  | 'traffic-light';

export type PetCategory = 'Mascot' | 'Human' | 'Robot' | 'Alien' | 'Animal';

export interface PetConfig {
  category: PetCategory;
  description: string;
  id: PetId;
  name: string;
}

export const PETS_LIST: PetConfig[] = [
  {
    id: 'apupepe',
    name: 'Apu Pepe',
    description: 'Le petit Pepe toujours prêt à aider.',
    category: 'Animal',
  },
  {
    id: 'chibi-rilakkuma',
    name: 'Chibi Rilakkuma',
    description: 'Le petit Rilakkuma, mignon et relax.',
    category: 'Mascot',
  },
  {
    id: 'claude-pixel',
    name: 'Claude Pixel',
    description: 'Un petit Claude tout mignon en pixel art.',
    category: 'Mascot',
  },
  {
    id: 'codix',
    name: 'Codix',
    description: 'Votre assistant robotique pour le code.',
    category: 'Robot',
  },
  { id: 'dario', name: 'Dario', description: 'Dario le développeur dévoué.', category: 'Human' },
  {
    id: 'dudu-bubu',
    name: 'Dudu Bubu',
    description: "L'inséparable duo Dudu et Bubu.",
    category: 'Animal',
  },
  {
    id: 'einstein',
    name: 'Einstein',
    description: 'Le légendaire scientifique pour éclairer vos lignes de code.',
    category: 'Human',
  },
  { id: 'gork', name: 'Gork', description: 'Un extra-terrestre amical.', category: 'Alien' },
  {
    id: 'jiji',
    name: 'Jiji',
    description: 'Jiji, le petit chat noir magique.',
    category: 'Animal',
  },
  {
    id: 'laughing-gemini',
    name: 'Gemini',
    description: 'Gemini, toujours souriant et intelligent.',
    category: 'Mascot',
  },
  {
    id: 'mini-elon',
    name: 'Mini Elon',
    description: 'Un visionnaire miniature dans votre interface.',
    category: 'Human',
  },
  {
    id: 'mini-sama',
    name: 'Mini Sama',
    description: 'Le petit Sama respectueux.',
    category: 'Human',
  },
  {
    id: 'problem',
    name: 'Problem',
    description: 'Un compagnon pour vous aider avec vos problèmes.',
    category: 'Mascot',
  },
  {
    id: 'maomao-the-cat',
    name: 'MaoMao',
    description: 'Le chat MaoMao, toujours curieux.',
    category: 'Animal',
  },
  {
    id: 'mr-poopybutthole',
    name: 'Mr Poopybutthole',
    description: 'Un ami loyal sur qui vous pouvez toujours compter, ooo-wee!',
    category: 'Alien',
  },
  {
    id: 'pingu',
    name: 'Pingu',
    description: 'Le plus célèbre des petits manchots, noot noot !',
    category: 'Animal',
  },
  {
    id: 'plum-tang',
    name: 'Plum Tang',
    description: 'Le compagnon fruité de vos aventures.',
    category: 'Mascot',
  },
  {
    id: 'quillfox',
    name: 'Quillfox',
    description: 'Un renard agile et astucieux pour guider vos projets.',
    category: 'Animal',
  },
  {
    id: 'traffic-light',
    name: 'Traffic Light',
    description: 'Un feu de circulation pour réguler votre code.',
    category: 'Robot',
  },
  {
    id: 'bytepilot',
    name: 'Bytepilot',
    description: 'Un pilote binaire pour vos aventures.',
    category: 'Robot',
  },
  {
    id: 'clerkhausen',
    name: 'Clerkhausen',
    description: 'Le majordome de vos données.',
    category: 'Human',
  },
  {
    id: 'doxi',
    name: 'Doxi',
    description: 'Votre petit renard de documentation.',
    category: 'Animal',
  },
  {
    id: 'gugu',
    name: 'Gugu',
    description: 'Le mystérieux Gugu.',
    category: 'Mascot',
  },
  {
    id: 'helmet-bunny',
    name: 'Helmet Bunny',
    description: 'Un lapin prêt pour la course.',
    category: 'Animal',
  },
  {
    id: 'red',
    name: 'Red',
    description: 'Le petit Red.',
    category: 'Mascot',
  },
  {
    id: 'tibo',
    name: 'Tibo',
    description: 'Tibo le compagnon d\'aventures.',
    category: 'Human',
  },
];
