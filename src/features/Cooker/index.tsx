'use client';

import { Icon } from '@lobehub/ui';
import { Button, Flex, message,Tag, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft,BookOpen, ChefHat, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import RecipeGenerator from './components/RecipeGenerator';
import RecipeHistory from './components/RecipeHistory';
import RecipeResult from './components/RecipeResult';
import type { Recipe } from './store/useCookerStore';
import { useCookerStore } from './store/useCookerStore';

type View = 'menu' | 'generator' | 'result' | 'history';

const BG = 'linear-gradient(135deg, #2d1b00 0%, #8B4513 50%, #D2691E 100%)';

const useStyles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    height: 100%;
    padding: 24px;
    color: white;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(210, 105, 30, 0.18) 0%, transparent 55%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 69, 19, 0.22) 0%, transparent 55%);
      pointer-events: none;
    }
  `,
  menuBox: css`
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(14px);
    border-radius: 28px;
    padding: 52px 48px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.14);
    min-width: 380px;
    max-width: 440px;
    text-align: center;
    position: relative;
    z-index: 1;
  `,
  logoCircle: css`
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(210, 105, 30, 0.35), rgba(139, 69, 19, 0.25));
    border: 3px solid rgba(210, 105, 30, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    margin: 0 auto 20px;
    box-shadow:
      0 0 0 8px rgba(210, 105, 30, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.3);
    animation: float 4s ease-in-out infinite;

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
  `,
  title: css`
    margin-top: 0 !important;
    font-size: 3.2rem !important;
    font-weight: 900 !important;
    color: white !important;
    text-shadow: 2px 3px 8px rgba(0, 0, 0, 0.4);
    letter-spacing: -0.02em;
    line-height: 1 !important;
    margin-bottom: 4px !important;
  `,
  subtitle: css`
    color: rgba(255, 255, 255, 0.65) !important;
    font-size: 1rem;
    margin-bottom: 8px !important;
    display: block;
  `,
  betaTag: css`
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 32px;
  `,
  button: css`
    height: 52px;
    font-size: 1rem;
    font-weight: 700;
    border-radius: 14px;
    margin-bottom: 12px;
    width: 100%;
    transition: all 0.2s ease !important;
    letter-spacing: 0.01em;
  `,
  primaryButton: css`
    background: linear-gradient(135deg, #D2691E, #8B4513) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 16px rgba(210, 105, 30, 0.4);

    &:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(210, 105, 30, 0.6) !important;
    }

    &:active {
      transform: translateY(0) !important;
    }
  `,
  secondaryButton: css`
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.18) !important;
    color: rgba(255, 255, 255, 0.85) !important;
    backdrop-filter: blur(4px);

    &:hover {
      background: rgba(255, 255, 255, 0.13) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
      color: white !important;
      transform: translateY(-1px) !important;
    }
  `,
  aboutBox: css`
    background: rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 14px 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    text-align: left;
    margin-top: 8px;
  `,
  backButton: css`
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 10;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border-radius: 12px !important;
    height: 40px !important;
    backdrop-filter: blur(8px);

    &:hover {
      border-color: rgba(255, 255, 255, 0.4) !important;
      color: white !important;
      background: rgba(255, 255, 255, 0.12) !important;
    }
  `,
}));

const CookerMain = () => {
  const { t } = useTranslation('extensions');
  const { styles } = useStyles();
  const [currentView, setCurrentView] = useState<View>('menu');
  const [showAbout, setShowAbout] = useState(false);

  const setCurrentRecipe = useCookerStore((s) => s.setCurrentRecipe);
  const currentRecipe = useCookerStore((s) => s.currentRecipe);
  const saveCurrentRecipe = useCookerStore((s) => s.saveCurrentRecipe);
  const clearCurrentRecipe = useCookerStore((s) => s.clearCurrentRecipe);

  const goMenu = () => {
    setCurrentView('menu');
    setShowAbout(false);
  };

  const handleRecipeGenerated = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCurrentView('result');
  };

  const handleSaveRecipe = () => {
    saveCurrentRecipe();
    void message.success('Recette sauvegardée ! 🎉');
  };

  const handleLoadRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCurrentView('result');
  };

  const bgStyle = { background: BG };

  // ─── Vue : Générateur ───
  if (currentView === 'generator') {
    return (
      <Flex align="center" className={styles.container} justify="center" style={bgStyle}>
        <Button
          className={styles.backButton}
          icon={<Icon icon={ArrowLeft} />}
          onClick={goMenu}
        >
          Menu
        </Button>
        <RecipeGenerator
          onBack={goMenu}
          onRecipeGenerated={handleRecipeGenerated}
        />
      </Flex>
    );
  }

  // ─── Vue : Résultat ───
  if (currentView === 'result') {
    return (
      <Flex align="center" className={styles.container} justify="center" style={bgStyle}>
        <Button
          className={styles.backButton}
          icon={<Icon icon={ArrowLeft} />}
          onClick={() => {
            clearCurrentRecipe();
            goMenu();
          }}
        >
          Menu
        </Button>
        <RecipeResult
          recipe={currentRecipe}
          onBack={() => setCurrentView('generator')}
          onSave={handleSaveRecipe}
        />
      </Flex>
    );
  }

  // ─── Vue : Historique ───
  if (currentView === 'history') {
    return (
      <Flex align="center" className={styles.container} justify="center" style={bgStyle}>
        <Button
          className={styles.backButton}
          icon={<Icon icon={ArrowLeft} />}
          onClick={goMenu}
        >
          Menu
        </Button>
        <RecipeHistory
          onBack={goMenu}
          onLoad={handleLoadRecipe}
        />
      </Flex>
    );
  }

  // ─── Vue : Menu Principal ───
  return (
    <Flex align="center" className={styles.container} justify="center" style={bgStyle}>
      <Flex vertical align="center" className={styles.menuBox} justify="center">
        {/* Logo */}
        <div className={styles.logoCircle}>🍳</div>

        {/* Titre */}
        <Typography.Title className={styles.title}>{t('cooker.title')}</Typography.Title>
        <Typography.Text className={styles.subtitle}>
          {t('cooker.subtitle')}
        </Typography.Text>
        <Tag className={styles.betaTag} color="warning">
          {t('cooker.beta')}
        </Tag>

        {/* Boutons */}
        <Flex vertical style={{ width: '100%' }}>
          <Button
            className={`${styles.button} ${styles.primaryButton}`}
            icon={<Icon icon={ChefHat} />}
            type="primary"
            onClick={() => setCurrentView('generator')}
          >
            {t('cooker.generateRecipe')}
          </Button>

          <Button
            className={`${styles.button} ${styles.secondaryButton}`}
            icon={<Icon icon={BookOpen} />}
            onClick={() => setCurrentView('history')}
          >
            {t('cooker.myRecipes')}
          </Button>

          <Button
            className={`${styles.button} ${styles.secondaryButton}`}
            icon={<Icon icon={Info} />}
            onClick={() => setShowAbout((v) => !v)}
          >
            {t('cooker.about')}
          </Button>
        </Flex>

        {/* Section À propos (toggle) */}
        {showAbout && (
          <div className={styles.aboutBox}>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.7, display: 'block' }}>
              {t('cooker.aboutDesc')}
            </Typography.Text>
          </div>
        )}
      </Flex>
    </Flex>
  );
};

export default CookerMain;
