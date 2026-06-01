'use client';

import { Icon } from '@lobehub/ui';
import { Button, Empty, Flex, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, BookOpen, ChefHat,Clock, Eye, Trash2 } from 'lucide-react';

import type { Recipe } from '../store/useCookerStore';
import { useCookerStore } from '../store/useCookerStore';

interface RecipeHistoryProps {
  onBack: () => void;
  onLoad: (recipe: Recipe) => void;
}

const styles = createStaticStyles(({ css }) => ({
  wrapper: css`
    width: 100%;
    max-width: 680px;
    padding: 0 16px;
  `,
  card: css`
    background: rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  `,
  header: css`
    padding: 28px 32px 20px;
    background: linear-gradient(135deg, rgba(210, 105, 30, 0.2), rgba(139, 69, 19, 0.15));
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    gap: 16px;
  `,
  headerTitle: css`
    font-size: 1.5rem !important;
    font-weight: 800 !important;
    color: white !important;
    margin: 0 !important;
  `,
  list: css`
    padding: 16px 20px;
    max-height: 60vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.04);
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(210, 105, 30, 0.4);
      border-radius: 4px;
    }
  `,
  recipeCard: css`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 16px 20px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(210, 105, 30, 0.35);
      transform: translateY(-1px);
    }
  `,
  recipeName: css`
    font-size: 1rem !important;
    font-weight: 700 !important;
    color: white !important;
    margin: 0 0 8px !important;
  `,
  recipeMeta: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 12px;
  `,
  metaBadge: css`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.55);
  `,
  actions: css`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `,
  viewBtn: css`
    height: 34px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    background: linear-gradient(135deg, #D2691E, #8B4513) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.35);

    &:hover {
      box-shadow: 0 4px 14px rgba(210, 105, 30, 0.55) !important;
      transform: translateY(-1px);
    }
  `,
  deleteBtn: css`
    height: 34px;
    border-radius: 10px;
    font-size: 0.82rem;
    font-weight: 600;
    background: rgba(220, 38, 38, 0.15) !important;
    border: 1px solid rgba(220, 38, 38, 0.3) !important;
    color: rgba(255, 120, 120, 0.9) !important;

    &:hover {
      background: rgba(220, 38, 38, 0.25) !important;
      border-color: rgba(220, 38, 38, 0.5) !important;
    }
  `,
  footer: css`
    padding: 16px 32px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  `,
  backBtn: css`
    height: 42px;
    border-radius: 12px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    background: transparent !important;

    &:hover {
      border-color: rgba(255, 255, 255, 0.4) !important;
      color: white !important;
    }
  `,
  emptyContainer: css`
    padding: 48px 24px;
    text-align: center;
  `,
}));

const MODE_EMOJIS: Record<string, string> = {
  classique: '🍳',
  thermomix: '🌀',
  airfryer: '💨',
  vapeur: '♨️',
  cocotte: '🫕',
};

const RecipeHistory = ({ onBack, onLoad }: RecipeHistoryProps) => {
  const savedRecipes = useCookerStore((s) => s.savedRecipes);
  const deleteRecipe = useCookerStore((s) => s.deleteRecipe);

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* En-tête */}
        <div className={styles.header}>
          <span style={{ fontSize: '2rem' }}>📚</span>
          <div>
            <Typography.Title className={styles.headerTitle}>Mes Recettes</Typography.Title>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              {savedRecipes.length} recette{savedRecipes.length !== 1 ? 's' : ''} sauvegardée{savedRecipes.length !== 1 ? 's' : ''}
            </Typography.Text>
          </div>
        </div>

        {/* Liste */}
        <div className={styles.list}>
          {savedRecipes.length === 0 ? (
            <div className={styles.emptyContainer}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
                    Aucune recette sauvegardée pour l'instant.<br />
                    Générez votre première recette ! 🍳
                  </span>
                }
              />
            </div>
          ) : (
            savedRecipes.map((recipe) => (
              <div className={styles.recipeCard} key={recipe.id}>
                <Typography.Title className={styles.recipeName} level={5}>
                  {MODE_EMOJIS[recipe.mode] || '🍽️'} {recipe.title}
                </Typography.Title>

                <div className={styles.recipeMeta}>
                  <span className={styles.metaBadge}>
                    <Icon icon={Clock} size={13} />
                    {recipe.prepTime} min
                  </span>
                  <span className={styles.metaBadge}>
                    <Icon icon={ChefHat} size={13} />
                    {recipe.mode}
                  </span>
                  <span className={styles.metaBadge}>
                    <Icon icon={BookOpen} size={13} />
                    {formatDate(recipe.createdAt)}
                  </span>
                </div>

                <Flex className={styles.actions} gap={8}>
                  <Button
                    className={styles.viewBtn}
                    icon={<Icon icon={Eye} size={14} />}
                    onClick={() => onLoad(recipe)}
                  >
                    Voir
                  </Button>
                  <Button
                    className={styles.deleteBtn}
                    icon={<Icon icon={Trash2} size={14} />}
                    onClick={() => deleteRecipe(recipe.id)}
                  >
                    Supprimer
                  </Button>
                </Flex>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            className={styles.backBtn}
            icon={<Icon icon={ArrowLeft} />}
            onClick={onBack}
          >
            Retour au menu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeHistory;
