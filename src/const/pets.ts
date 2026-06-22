export type PetId =
  | 'apupepe'
  | 'boba-style'
  | 'burgy'
  | 'bytepilot'
  | 'chibi-rilakkuma'
  | 'claude-pixel'
  | 'clerkhausen'
  | 'codix'
  | 'corgi'
  | 'dario'
  | 'dash'
  | 'doxi'
  | 'dudu-bubu'
  | 'einstein'
  | 'gork'
  | 'grogu'
  | 'gugu'
  | 'helmet-bunny'
  | 'jige'
  | 'jiji'
  | 'laughing-gemini'
  | 'levi'
  | 'mini-elon'
  | 'mini-sama'
  | 'maomao-the-cat'
  | 'mr-poopybutthole'
  | 'party-codie'
  | 'patamon'
  | 'pingu'
  | 'plum-tang'
  | 'po-teletubby'
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
  imagePrefix?: string;
}

export const PETS_LIST: PetConfig[] = [
  {
    id: 'apupepe',
    name: 'Apu Pepe',
    description: 'Le petit Pepe toujours prêt à aider.',
    category: 'Animal',
  },
  {
    id: 'boba-style',
    name: 'Boba',
    description: 'Un adorable gobelet de thé aux perles qui adore sautiller.',
    category: 'Mascot',
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
  {
    id: 'corgi',
    name: 'Corgi',
    description: "Un adorable petit Corgi plein d'énergie pour égayer votre journée.",
    category: 'Animal',
  },
  { id: 'dario', name: 'Dario', description: 'Dario le développeur dévoué.', category: 'Human' },
  {
    id: 'dash',
    name: 'Dash',
    description: 'Le colibri bleu et vif pour dynamiser votre espace de travail.',
    category: 'Mascot',
  },
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
    id: 'grogu',
    name: 'Grogu',
    description: "L'adorable bébé alien qui maîtrise la Force (et adore les grenouilles).",
    category: 'Alien',
    imagePrefix: 'grogu-kid',
  },
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
    id: 'levi',
    name: 'Levi',
    description: 'Un guerrier chibi impassible et redoutable pour veiller sur votre code.',
    category: 'Human',
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
    id: 'party-codie',
    name: 'Party Codie',
    description: 'Codie en mode fête, prêt à célébrer chaque déploiement réussi.',
    category: 'Mascot',
  },
  {
    id: 'patamon',
    name: 'Patamon',
    description: 'Le Digimon ailé toujours optimiste et courageux.',
    category: 'Mascot',
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
    id: 'po-teletubby',
    name: 'Po',
    description: 'Le plus mignon des Teletubbies, toujours joyeux et joueur.',
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
    description: 'Un copilote robotique pour naviguer à travers vos algorithmes les plus complexes.',
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
    description: "Gugu, une petite créature ronde et mystérieuse dotée d'une grande sagesse.",
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
    description: 'Le petit oiseau rouge colérique mais attachant.',
    category: 'Mascot',
  },
  {
    id: 'tibo',
    name: 'Tibo',
    description: "Tibo, un aventurier intrépide toujours prêt à explorer de nouvelles lignes de code.",
    category: 'Human',
  },
  {
    id: 'burgy',
    name: 'Burgy',
    description: 'Un délicieux burger pour vous tenir compagnie.',
    category: 'Mascot',
  },
  {
    id: 'jige',
    name: 'Jige',
    description: 'Jige, votre nouveau compagnon dynamique.',
    category: 'Animal',
  },
];
