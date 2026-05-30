'use client';

import { ActionIcon, DraggablePanel, DraggablePanelContainer, Tooltip, Flexbox, Tag, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { 
  GraduationCap, 
  Music, 
  ChefHat, 
  Heart, 
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';

/**
 * Interface pour définir l'état global du panneau d'extensions géré par Zustand.
 */
interface ExtensionState {
  isOpen: boolean;
  width: number;
  setIsOpen: (isOpen: boolean) => void;
  setWidth: (width: number) => void;
  toggle: () => void;
}

/**
 * Store Zustand dédié pour gérer de manière réactive l'état d'ouverture,
 * de fermeture et de largeur dynamique du panneau latéral des extensions.
 */
export const useExtensionStore = create<ExtensionState>((set) => ({
  isOpen: true,
  width: 320,
  setIsOpen: (isOpen) => set({ isOpen }),
  setWidth: (width) => set({ width }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

/**
 * Interface explicitant les propriétés du composant ExtensionsSidebarPanel.
 * Typage strict garantissant la conformité TypeScript.
 */
export interface ExtensionsSidebarPanelProps {
  className?: string;
}

/**
 * Représentation d'une carte de service (mService).
 */
interface ServiceCardItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  route: string;
  category: string;
  author: string;
  isOfficial?: boolean;
  statusTag?: string;
}

/**
 * Liste des projets fondamentaux mServices avec leurs icônes, catégories, tags de statut et descriptions associées.
 */
const SERVICES_LIST: ServiceCardItem[] = [
  {
    id: 'quizzly',
    title: 'Quizzly',
    description: 'Évaluez vos connaissances de manière interactive.',
    icon: GraduationCap,
    route: '/services/quizzly',
    category: 'Éducation',
    author: 'mServices',
    isOfficial: true,
    statusTag: 'Populaire',
  },
  {
    id: 'vibs',
    title: 'Vibs',
    description: 'Explorez et créez des ambiances immersives.',
    icon: Music,
    route: '/services/vibs',
    category: 'Musique',
    author: 'mServices',
    isOfficial: true,
  },
  {
    id: 'cooker',
    title: 'Cooker',
    description: 'Générez des recettes intelligentes au quotidien.',
    icon: ChefHat,
    route: '/services/cooker',
    category: 'Cuisine',
    author: 'mServices',
    isOfficial: true,
    statusTag: 'Nouveau',
  },
  {
    id: 'health',
    title: 'Health',
    description: 'Suivez vos métriques de bien-être physique.',
    icon: Heart,
    route: '/services/health',
    category: 'Santé',
    author: 'mServices',
    isOfficial: true,
  },
];

/**
 * Définition des styles dynamiques via l'API createStyles d'antd-style.
 * S'inspire directement du design system premium de la page Communauté (McpItem).
 */
const useStyles = createStyles(({ css, token }) => {
  // Courbe de Bézier personnalisée pour des animations organiques, fluides et élégantes.
  const cubicBezierAnimation = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
  
  return {
    panel: css`
      height: 100%;
      background: ${token.colorBgLayout};
      border-right: 1px solid ${token.colorBorderSecondary};
      transition: width 0.3s ${cubicBezierAnimation}, background-color 0.3s ease;
      display: flex;
      flex-direction: column;
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgContainer};
    `,
    titleContainer: css`
      display: flex;
      align-items: center;
      gap: 8px;
    `,
    titleIcon: css`
      color: ${token.colorPrimary};
    `,
    titleText: css`
      font-size: 16px;
      font-weight: 750;
      color: ${token.colorText};
      margin: 0;
      letter-spacing: -0.02em;
    `,
    content: css`
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `,
    listContainer: css`
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    `,
    card: css`
      cursor: pointer;
      position: relative;
      border-radius: ${token.borderRadiusLG}px;
      border: 1px solid ${token.colorBorderSecondary};
      background: ${token.colorBgContainer};
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
      
      // Configuration des transitions fluides et organiques (courbe cubique personnalisée)
      transition: 
        transform 0.4s ${cubicBezierAnimation}, 
        box-shadow 0.4s ${cubicBezierAnimation}, 
        border-color 0.4s ${cubicBezierAnimation},
        background-color 0.3s ease;

      // Hover State (Survol) s'inspirant des élévations de la Communauté
      &:hover {
        transform: translateY(-4px); /* Translation verticale négative */
        border-color: ${token.colorPrimary};
        background: ${token.colorFillAlter}; /* Intensification de l'opacité de fond */
        
        /* Ombre portée colorée subtilement dérivée de la couleur primaire */
        box-shadow: 0 8px 20px -8px ${token.colorPrimaryActive};
        
        .card-avatar-icon {
          color: ${token.colorPrimary};
          transform: scale(1.1);
        }
      }
    `,
    cardHeader: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    `,
    cardMeta: css`
      display: flex;
      align-items: center;
      gap: 12px;
    `,
    avatarWrapper: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: ${token.borderRadius}px;
      background: ${token.colorBgLayout};
      color: ${token.colorTextSecondary};
      transition: transform 0.3s ${cubicBezierAnimation}, color 0.3s ease;
    `,
    cardTitleInfo: css`
      display: flex;
      flex-direction: column;
      gap: 2px;
    `,
    cardTitleLine: css`
      display: flex;
      align-items: center;
      gap: 6px;
    `,
    cardTitleText: css`
      font-size: 14px;
      font-weight: 700;
      color: ${token.colorText};
      margin: 0;
      letter-spacing: -0.01em;
    `,
    officialBadge: css`
      display: flex;
      align-items: center;
      color: ${token.colorSuccess};
    `,
    cardAuthor: css`
      font-size: 11px;
      color: ${token.colorTextDescription};
    `,
    cardDesc: css`
      font-size: 12px;
      color: ${token.colorTextSecondary};
      margin: 0;
      line-height: 1.4;
    `,
    cardFooter: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 4px;
      padding-top: 8px;
      border-top: 1px dashed ${token.colorBorder};
    `,
    categoryTag: css`
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: ${token.colorBgLayout};
      color: ${token.colorTextSecondary};
    `,
  };
});

/**
 * Composant ExtensionsSidebarPanel
 * Panel latéral revisité avec un design de cartes enrichi,
 * inspiré par la finesse et la structure des items de la page Communauté (McpItem).
 */
export const ExtensionsSidebarPanel = memo<ExtensionsSidebarPanelProps>(({ className }) => {
  const { styles } = useStyles();
  const navigate = useNavigate();
  
  // Lecture de l'état réactif global Zustand pour le panneau
  const { isOpen, width, setIsOpen, setWidth } = useExtensionStore();

  /**
   * Gère le redimensionnement interactif du panneau via DraggablePanel.
   */
  const handleSizeChange = (_: any, size: any) => {
    if (!size) return;
    const nextWidth = typeof size.width === 'string' ? Number.parseInt(size.width, 10) : size.width;
    if (nextWidth && nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  /**
   * Action au clic sur une carte : redirection vers la route du service.
   */
  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <DraggablePanel
      className={styles.panel}
      defaultSize={{ width }}
      expand={isOpen}
      maxWidth={400}
      minWidth={280}
      mode="fixed"
      placement="left"
      size={{ height: '100%', width }}
      onExpandChange={setIsOpen}
      onSizeChange={handleSizeChange}
    >
      <DraggablePanelContainer
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        {/* En-tête du panneau avec bouton de repliement */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <Sparkles className={styles.titleIcon} size={18} />
            <h3 className={styles.titleText}>mServices</h3>
          </div>
          <Tooltip title="Masquer le panneau">
            <ActionIcon
              icon={X}
              onClick={() => setIsOpen(false)}
              size={{ blockSize: 24, fontSize: 14 }}
            />
          </Tooltip>
        </div>

        {/* Corps principal : Liste enrichie des services */}
        <div className={styles.content}>
          <div className={styles.listContainer}>
            {SERVICES_LIST.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className={styles.card}
                  onClick={() => handleCardClick(service.route)}
                >
                  {/* Ligne En-tête de carte avec Avatar et Titre */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardMeta}>
                      <div className={`${styles.avatarWrapper} card-avatar-icon`}>
                        <IconComponent size={20} />
                      </div>
                      <div className={styles.cardTitleInfo}>
                        <div className={styles.cardTitleLine}>
                          <h4 className={styles.cardTitleText}>{service.title}</h4>
                          {service.isOfficial && (
                            <Tooltip title="Service Officiel certifié par mAI">
                              <span className={styles.officialBadge}>
                                <CheckCircle2 size={12} fill="currentColor" style={{ color: 'white' }} />
                              </span>
                            </Tooltip>
                          )}
                        </div>
                        <span className={styles.cardAuthor}>par {service.author}</span>
                      </div>
                    </div>
                    {/* Tag de statut optionnel */}
                    {service.statusTag && (
                      <Tag size="small" variant="default">
                        {service.statusTag}
                      </Tag>
                    )}
                  </div>

                  {/* Micro-description du service */}
                  <p className={styles.cardDesc}>{service.description}</p>

                  {/* Pied de carte avec tag de catégorie et indicateur d'action */}
                  <div className={styles.cardFooter}>
                    <span className={styles.categoryTag}>{service.category}</span>
                    <Text size="small" type="primary">Lancer →</Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DraggablePanelContainer>
    </DraggablePanel>
  );
});

ExtensionsSidebarPanel.displayName = 'ExtensionsSidebarPanel';

export default ExtensionsSidebarPanel;
