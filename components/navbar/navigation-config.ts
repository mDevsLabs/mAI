export interface NavSubItem {
  name: string;
  href: string;
  subitems?: { name: string; href: string }[];
}

export interface NavItem {
  name: string;
  href: string;
  subitems?: NavSubItem[];
}

export const navLinks: NavItem[] = [
  { name: "Actualités", href: "/news" },
  {
    name: "Modèles",
    href: "/models",
    subitems: [
      { name: "Tous les modèles", href: "/models" },
      {
        name: "mAI-2",
        href: "/models#mai-2",
        subitems: [
          { name: "mAI-2", href: "/models/mai-2" },
          { name: "mAI-2-Mini", href: "/models/mai-2-mini" },
        ],
      },
      {
        name: "mAI-1.5",
        href: "/models#mai-1.5",
        subitems: [
          { name: "mAI-1.5-Light", href: "/models/mai-1.5-light" },
          { name: "mAI-1.5-Apex", href: "/models/mai-1.5-apex" },
          { name: "mAI-1.5-Opal", href: "/models/mai-1.5-opal" },
        ],
      },
      {
        name: "mAI-1.2",
        href: "/models#mai-1.2",
        subitems: [
          { name: "mAI-1.2-Light", href: "/models/mai-1.2-light" },
          { name: "mAI-1.2-Apex", href: "/models/mai-1.2-apex" },
          { name: "mAI-1.2-Opal", href: "/models/mai-1.2-opal" },
        ],
      },
      {
        name: "mAI-1",
        href: "/models#mai-1",
        subitems: [
          { name: "mAI-1", href: "/models/mai-1" },
          { name: "mAI-1-Light", href: "/models/mai-1-light" },
        ],
      },
    ],
  },
  {
    name: "Projets",
    href: "/projects",
    subitems: [
      { name: "Tous les projets", href: "/projects" },
      { name: "Vibe", href: "/projects/vibe" },
      { name: "Web", href: "/projects/web" },
      { name: "Pulse", href: "/projects/pulse" },
      { name: "CLI", href: "/projects/cli" },
      { name: "Coder", href: "/projects/coder" },
    ],
  },
  {
    name: "API",
    href: "/account/keys",
    subitems: [
      {
        name: "Modèles",
        href: "/account/models",
        subitems: [
          { name: "Modèles Texte", href: "/account/models" },
          { name: "Modèles Images", href: "/account/models/images" },
          { name: "Modèles Audio", href: "/account/models/audio" },
          { name: "Modèles mAI", href: "/account/models/mai" },
        ],
      },
      { name: "Clés API", href: "/account/keys" },
      { name: "Requêtes", href: "/account/requests" },
      { name: "Usage", href: "/account/usage" },
      { name: "Configuration", href: "/account/config" },
    ],
  },
  { name: "Tarifs", href: "/pricing" },
  {
    name: "Plus",
    href: "/support",
    subitems: [
      { name: "Support", href: "/support" },
      { name: "Documentation", href: "/docs" },
      { name: "Téléchargements", href: "/downloads" },
    ],
  },
];

export function checkSubActive(sub: NavSubItem, pathname: string): boolean {
  if (pathname === sub.href) return true;
  if (sub.subitems?.some((nested) => pathname === nested.href)) return true;
  return false;
}

export function checkLinkActive(link: NavItem, pathname: string): boolean {
  if (pathname === link.href) return true;
  if (link.subitems?.some((sub) => checkSubActive(sub, pathname))) return true;
  return false;
}
