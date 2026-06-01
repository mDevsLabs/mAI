'use client';

import { Icon } from '@lobehub/ui';
import { Button, Dropdown, Flex, Input, message, Modal, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, Bookmark, ChefHat, Clock, Copy, Download, ListTodo, Printer, Scale, Share2, Users, Utensils } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { lambdaClient } from '@/libs/trpc/client';

import { type Recipe } from '../store/useCookerStore';

interface RecipeResultProps {
  onBack: () => void;
  onSave: () => void;
  recipe: Recipe | null;
}

const styles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    max-width: 700px;
    padding: 0 16px;
  `,
  card: css`
    background: rgba(255, 255, 255, 0.07);
    backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  `,
  header: css`
    padding: 32px 36px 24px;
    background: linear-gradient(135deg, rgba(210, 105, 30, 0.25), rgba(139, 69, 19, 0.2));
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  `,
  emoji: css`
    font-size: 3rem;
    margin-bottom: 12px;
    display: block;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  `,
  title: css`
    font-size: 1.8rem !important;
    font-weight: 800 !important;
    color: white !important;
    margin: 0 0 16px !important;
    text-shadow: 1px 2px 4px rgba(0,0,0,0.4);
    line-height: 1.2 !important;
  `,
  badges: css`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  `,
  badge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.82rem;
    font-weight: 600;
    backdrop-filter: blur(6px);
  `,
  body: css`
    padding: 28px 36px 32px;
    max-height: 55vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(210, 105, 30, 0.5);
      border-radius: 4px;
    }
  `,
  sectionTitle: css`
    font-size: 1rem !important;
    font-weight: 700 !important;
    color: #D2691E !important;
    margin: 0 0 14px !important;
    display: flex;
    align-items: center;
    gap: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,
  ingredientList: css`
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
  `,
  ingredientItem: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.88rem;

    &::before {
      content: '•';
      color: #D2691E;
      font-size: 1.2em;
      font-weight: bold;
    }
  `,
  stepsList: css`
    list-style: none;
    padding: 0;
    margin: 0 0 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  `,
  stepItem: css`
    display: flex;
    gap: 14px;
    align-items: flex-start;
  `,
  stepNumber: css`
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D2691E, #8B4513);
    color: white;
    font-weight: 800;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(210, 105, 30, 0.4);
  `,
  stepText: css`
    color: rgba(255, 255, 255, 0.82);
    font-size: 0.9rem;
    line-height: 1.6;
    padding-top: 5px;
  `,
  footer: css`
    padding: 20px 36px 28px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `,
  backBtn: css`
    height: 44px;
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
  saveBtn: css`
    height: 44px;
    border-radius: 12px;
    font-weight: 700;
    background: linear-gradient(135deg, #D2691E, #8B4513) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 14px rgba(210, 105, 30, 0.4);
    transition: all 0.2s ease !important;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(210, 105, 30, 0.6) !important;
    }
  `,
  shareBtn: css`
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    color: white !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }
  `,
  printBtn: css`
    height: 44px;
    border-radius: 12px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    color: white !important;

    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      border-color: rgba(255, 255, 255, 0.3) !important;
    }
  `,
  emptyState: css`
    text-align: center;
    padding: 48px 24px;
    color: rgba(255, 255, 255, 0.5);
  `,
  macrosContainer: css`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  `,
  macroCard: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 6px;
    text-align: center;
  `,
  macroValue: css`
    font-size: 1.1rem;
    font-weight: 700;
    color: #D2691E;
  `,
  macroLabel: css`
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    margin-top: 2px;
  `,
  shoppingContainer: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 28px;
  `,
  shoppingHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  `,
  shoppingList: css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  shoppingItem: css`
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.88rem;
  `,
  checkboxPlaceholder: css`
    width: 16px;
    height: 16px;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    border-radius: 4px;
    flex-shrink: 0;
  `,
}));

const MODE_LABELS: Record<string, string> = {
  classique: '🍳 Classique',
  thermomix: '🌀 Thermomix',
  airfryer: '💨 Air Fryer',
  vapeur: '♨️ Vapeur',
  cocotte: '🫕 Cocotte-Minute',
};

const RecipeResult = ({ recipe, onSave, onBack }: RecipeResultProps) => {
  const { t } = useTranslation('extensions');
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handlePrintPDF = () => {
    if (!recipe) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styleHtml = `
      <html>
        <head>
          <title>Recette : ${recipe.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            body {
              font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #2D241E;
              background: #fff;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .recipe-card {
              border: 3px double #D2691E;
              border-radius: 20px;
              padding: 40px;
              background: #FCF9F5;
              box-shadow: 0 4px 20px rgba(139, 69, 19, 0.08);
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #D2691E;
              padding-bottom: 25px;
              margin-bottom: 30px;
            }
            .emoji {
              font-size: 3.5rem;
              margin-bottom: 12px;
              display: inline-block;
            }
            h1 {
              color: #8B4513;
              font-size: 2.4rem;
              margin: 0 0 16px;
              font-weight: 800;
            }
            .meta-info {
              display: flex;
              justify-content: center;
              gap: 20px;
              font-size: 1.05rem;
              font-weight: 600;
              color: #5C4033;
            }
            .meta-item {
              background: rgba(210, 105, 30, 0.1);
              padding: 8px 18px;
              border-radius: 20px;
              border: 1px solid rgba(210, 105, 30, 0.2);
            }
            h2 {
              color: #8B4513;
              font-size: 1.4rem;
              border-bottom: 2px solid rgba(210, 105, 30, 0.25);
              padding-bottom: 6px;
              margin-top: 35px;
              margin-bottom: 18px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
            }
            ul, ol {
              padding-left: 24px;
              margin: 0;
            }
            li {
              margin-bottom: 10px;
              line-height: 1.6;
              font-size: 1.05rem;
            }
            .steps li {
              margin-bottom: 16px;
            }
            .nutritional-info {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
              text-align: center;
            }
            .macro {
              background: #fff;
              border: 1.5px solid rgba(210, 105, 30, 0.15);
              border-radius: 12px;
              padding: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            }
            .macro-val {
              font-weight: 800;
              color: #D2691E;
              font-size: 1.25rem;
            }
            .macro-lbl {
              font-size: 0.78rem;
              color: #7C6E64;
              text-transform: uppercase;
              font-weight: 600;
              margin-top: 4px;
            }
            @media print {
              body {
                padding: 0;
                background: #fff;
              }
              .recipe-card {
                border: none;
                box-shadow: none;
                background: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="recipe-card">
            <div class="header">
              <span class="emoji">🍳</span>
              <h1>${recipe.title}</h1>
              <div class="meta-info">
                <span class="meta-item">👤 ${recipe.servings} ${recipe.servings > 1 ? t('cooker.servings_plural') : t('cooker.servings')}</span>
                <span class="meta-item">⏱️ ${recipe.prepTime} min</span>
                <span class="meta-item">🧑‍🍳 ${MODE_LABELS[recipe.mode] || recipe.mode}</span>
              </div>
            </div>
            
            ${recipe.nutritionalInfo ? `
            <h2>📊 Valeurs nutritionnelles (par portion)</h2>
            <div class="nutritional-info">
              <div class="macro">
                <div class="macro-val">${recipe.nutritionalInfo.calories}</div>
                <div class="macro-lbl">kcal</div>
              </div>
              <div class="macro">
                <div class="macro-val">${recipe.nutritionalInfo.protein}g</div>
                <div class="macro-lbl">Protéines</div>
              </div>
              <div class="macro">
                <div class="macro-val">${recipe.nutritionalInfo.carbs}g</div>
                <div class="macro-lbl">Glucides</div>
              </div>
              <div class="macro">
                <div class="macro-val">${recipe.nutritionalInfo.fat}g</div>
                <div class="macro-lbl">Lipides</div>
              </div>
            </div>
            ` : ''}

            <div class="grid">
              <div>
                <h2>🥦 Ingrédients</h2>
                <ul>
                  ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
              </div>
              
              ${recipe.shoppingList && recipe.shoppingList.length > 0 ? `
              <div>
                <h2>🛒 Liste de courses</h2>
                <ul>
                  ${recipe.shoppingList.map(item => `<li>☐ ${item}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </div>

            <h2>👩‍🍳 Préparation</h2>
            <ol class="steps">
              ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(styleHtml);
    printWindow.document.close();
    message.success(t('cooker.printSuccess'));
  };

  if (!recipe) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
              Aucune recette générée
            </Typography.Text>
          </div>
        </div>
      </div>
    );
  }

  const formatRecipeMarkdown = (r: Recipe) => {
    let md = `# 🍳 ${r.title}\n\n`;
    md += `⏱ **Temps de préparation** : ${r.prepTime} min | 👤 **Portions** : ${r.servings} personne(s) | 🍳 **Mode de cuisson** : ${MODE_LABELS[r.mode] || r.mode}\n\n`;
    
    if (r.nutritionalInfo) {
      md += `### 📊 Informations nutritionnelles (par portion)\n`;
      md += `- 🔥 **Calories** : ${r.nutritionalInfo.calories} kcal\n`;
      md += `- 🥩 **Protéines** : ${r.nutritionalInfo.protein} g\n`;
      md += `- 🍞 **Glucides** : ${r.nutritionalInfo.carbs} g\n`;
      md += `- 🧈 **Lipides** : ${r.nutritionalInfo.fat} g\n\n`;
    }
    
    if (r.ingredients && r.ingredients.length > 0) {
      md += `### 🥦 Ingrédients\n`;
      r.ingredients.forEach((ing) => {
        md += `- ${ing}\n`;
      });
      md += `\n`;
    }

    if (r.shoppingList && r.shoppingList.length > 0) {
      md += `### 🛒 Liste de courses\n`;
      r.shoppingList.forEach((item) => {
        md += `- [ ] ${item}\n`;
      });
      md += `\n`;
    }
    
    if (r.steps && r.steps.length > 0) {
      md += `### 👩‍🍳 Préparation\n`;
      r.steps.forEach((step, idx) => {
        md += `${idx + 1}. ${step}\n`;
      });
    }
    return md;
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const markdown = formatRecipeMarkdown(recipe);
      const res = await lambdaClient.cooker.shareRecipe.mutate({
        title: recipe.title,
        content: markdown,
      });

      if (res?.success && res.shareId) {
        const url = `${window.location.origin}/share/t/${res.shareId}`;
        setShareUrl(url);
        setShareModalOpen(true);
      } else {
        message.error('Impossible de générer le lien de partage.');
      }
    } catch (e) {
      console.error(e);
      message.error('Une erreur est survenue lors de la création du partage.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success('Lien copié dans le presse-papiers !');
  };

  const downloadAsJSON = () => {
    if (!recipe.shoppingList) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(recipe.shoppingList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `liste-courses-${recipe.id}.json`);
    document.body.append(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    message.success('Liste de courses JSON téléchargée !');
  };

  const downloadAsTXT = () => {
    if (!recipe.shoppingList) return;
    const txtContent = `LISTE DE COURSES - ${recipe.title.toUpperCase()}\n\n` +
      recipe.shoppingList.map((item) => `[ ] ${item}`).join('\n');
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `liste-courses-${recipe.id}.txt`);
    document.body.append(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    message.success('Liste de courses TXT téléchargée !');
  };

  const downloadMenuItems = [
    {
      key: 'json',
      label: 'Fichier JSON (.json)',
      onClick: downloadAsJSON,
    },
    {
      key: 'txt',
      label: 'Fichier Texte (.txt)',
      onClick: downloadAsTXT,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.emoji}>🍽️</span>
          <Typography.Title className={styles.title}>{recipe.title}</Typography.Title>
          <div className={styles.badges}>
            <span className={styles.badge}>
              <Icon icon={Users} size={14} />
              {recipe.servings} portion{recipe.servings > 1 ? 's' : ''}
            </span>
            <span className={styles.badge}>
              <Icon icon={Clock} size={14} />
              {recipe.prepTime} min
            </span>
            <span className={styles.badge}>
              <Icon icon={ChefHat} size={14} />
              {MODE_LABELS[recipe.mode] || recipe.mode}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Nutrition Info */}
          {recipe.nutritionalInfo && (
            <>
              <Typography.Title className={styles.sectionTitle} level={5}>
                <Icon icon={Scale} size={16} />
                Informations Nutritionnelles (Portion)
              </Typography.Title>
              <div className={styles.macrosContainer}>
                <div className={styles.macroCard}>
                  <div className={styles.macroValue}>{recipe.nutritionalInfo.calories}</div>
                  <div className={styles.macroLabel}>kcal</div>
                </div>
                <div className={styles.macroCard}>
                  <div className={styles.macroValue}>{recipe.nutritionalInfo.protein}g</div>
                  <div className={styles.macroLabel}>Protéines</div>
                </div>
                <div className={styles.macroCard}>
                  <div className={styles.macroValue}>{recipe.nutritionalInfo.carbs}g</div>
                  <div className={styles.macroLabel}>Glucides</div>
                </div>
                <div className={styles.macroCard}>
                  <div className={styles.macroValue}>{recipe.nutritionalInfo.fat}g</div>
                  <div className={styles.macroLabel}>Lipides</div>
                </div>
              </div>
            </>
          )}

          {/* Liste de courses */}
          {recipe.shoppingList && recipe.shoppingList.length > 0 && (
            <div className={styles.shoppingContainer}>
              <div className={styles.shoppingHeader}>
                <Typography.Title className={styles.sectionTitle} level={5} style={{ margin: 0 }}>
                  <Icon icon={ListTodo} size={16} />
                  Liste de courses
                </Typography.Title>
                <Dropdown menu={{ items: downloadMenuItems }} trigger={['click']}>
                  <Button icon={<Icon icon={Download} />} size="small" style={{ fontSize: '0.8rem', borderRadius: 8 }}>
                    Exporter / Télécharger
                  </Button>
                </Dropdown>
              </div>
              <ul className={styles.shoppingList}>
                {recipe.shoppingList.map((item, idx) => (
                  <li className={styles.shoppingItem} key={idx}>
                    <div className={styles.checkboxPlaceholder} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ingrédients */}
          <Typography.Title className={styles.sectionTitle} level={5}>
            <Icon icon={Utensils} size={16} />
            Ingrédients
          </Typography.Title>
          <ul className={styles.ingredientList}>
            {recipe.ingredients.map((ingredient, i) => (
              <li className={styles.ingredientItem} key={i}>{ingredient}</li>
            ))}
          </ul>

          {/* Étapes */}
          <Typography.Title className={styles.sectionTitle} level={5}>
            <Icon icon={ChefHat} size={16} />
            Préparation
          </Typography.Title>
          <ol className={styles.stepsList}>
            {recipe.steps.map((step, i) => (
              <li className={styles.stepItem} key={i}>
                <div className={styles.stepNumber}>{i + 1}</div>
                <span className={styles.stepText}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <Flex className={styles.footer} gap={12}>
          <Button
            className={styles.backBtn}
            icon={<Icon icon={ArrowLeft} />}
            onClick={onBack}
          >
            {t('cooker.back')}
          </Button>
          <Button
            className={styles.printBtn}
            icon={<Icon icon={Printer} />}
            onClick={handlePrintPDF}
          >
            {t('cooker.printRecipe')}
          </Button>
          <Button
            className={styles.shareBtn}
            icon={<Icon icon={Share2} />}
            loading={isSharing}
            onClick={handleShare}
          >
            {t('cooker.share')}
          </Button>
          <Button
            className={styles.saveBtn}
            icon={<Icon icon={Bookmark} />}
            onClick={onSave}
          >
            {t('cooker.save')}
          </Button>
        </Flex>
      </div>

      {/* Modale de partage */}
      <Modal
        open={shareModalOpen}
        title="Partager la recette Cooker 🔗"
        footer={[
          <Button key="close" onClick={() => setShareModalOpen(false)}>
            Fermer
          </Button>,
          <Button icon={<Icon icon={Copy} />} key="copy" type="primary" onClick={copyToClipboard}>
            Copier le lien
          </Button>,
        ]}
        onCancel={() => setShareModalOpen(false)}
      >
        <Typography.Paragraph style={{ marginTop: 12 }} type="secondary">
          Ce lien public unique permet à vos amis ou invités de consulter la fiche de cette recette directement en ligne.
        </Typography.Paragraph>
        <Input
          readOnly
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.9rem', color: 'var(--ant-color-text-secondary)', background: 'rgba(255,255,255,0.03)' }}
          value={shareUrl}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </Modal>
    </div>
  );
};

export default RecipeResult;
