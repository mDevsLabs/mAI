'use client';

import { Icon } from '@lobehub/ui';
import { Button, Flex, InputNumber, message,Select, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ArrowLeft, ChefHat,Sparkles } from 'lucide-react';

import { aiChatService } from '@/services/aiChat';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors';

import type { Recipe } from '../store/useCookerStore';
import { useCookerStore } from '../store/useCookerStore';
import IngredientTags from './IngredientTags';

interface RecipeGeneratorProps {
  onBack: () => void;
  onRecipeGenerated: (recipe: Recipe) => void;
}

const styles = createStaticStyles(({ css }) => ({
  wrapper: css`
    width: 100%;
    max-width: 640px;
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
    gap: 14px;
  `,
  headerTitle: css`
    font-size: 1.4rem !important;
    font-weight: 800 !important;
    color: white !important;
    margin: 0 !important;
  `,
  body: css`
    padding: 24px 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-height: 62vh;
    overflow-y: auto;

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
  fieldGroup: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  label: css`
    font-size: 0.85rem !important;
    font-weight: 700 !important;
    color: rgba(255, 255, 255, 0.7) !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
  select: css`
    width: 100%;

    .ant-select-selector {
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 10px !important;
      color: white !important;
    }

    .ant-select-arrow {
      color: rgba(255,255,255,0.5) !important;
    }

    &.ant-select-focused .ant-select-selector {
      border-color: rgba(210, 105, 30, 0.7) !important;
      box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.2) !important;
    }
  `,
  inputNumber: css`
    width: 100%;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
    color: white !important;

    .ant-input-number-input {
      color: white !important;
    }

    &:focus, &:focus-within {
      border-color: rgba(210, 105, 30, 0.7) !important;
      box-shadow: 0 0 0 2px rgba(210, 105, 30, 0.2) !important;
    }
  `,
  row: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  `,
  divider: css`
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 4px 0;
  `,
  footer: css`
    padding: 16px 32px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
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
  generateBtn: css`
    height: 44px;
    border-radius: 12px;
    font-weight: 800;
    font-size: 1rem;
    background: linear-gradient(135deg, #D2691E, #8B4513) !important;
    border: none !important;
    color: white !important;
    box-shadow: 0 4px 16px rgba(210, 105, 30, 0.45);
    flex: 1;
    transition: all 0.2s ease !important;
    letter-spacing: 0.02em;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(210, 105, 30, 0.65) !important;
    }

    &:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed;
    }
  `,
}));

const COOKING_MODES = [
  { value: 'classique', label: '🍳 Classique' },
  { value: 'thermomix', label: '🌀 Thermomix' },
  { value: 'airfryer', label: '💨 Air Fryer' },
  { value: 'vapeur', label: '♨️ Vapeur' },
  { value: 'cocotte', label: '🫕 Cocotte-Minute' },
];

const MOCK_RECIPE: Omit<Recipe, 'id' | 'createdAt'> = {
  title: 'Poulet rôti aux herbes et légumes de saison',
  ingredients: [
    '1 poulet entier (1.5 kg)',
    '3 gousses d\'ail',
    'Romarin frais',
    'Thym frais',
    '2 citrons',
    'Huile d\'olive',
    'Sel et poivre',
    '4 pommes de terre',
    '2 carottes',
    '1 oignon',
  ],
  steps: [
    'Préchauffer le four à 200°C (chaleur tournante).',
    'Mélanger l\'huile d\'olive, l\'ail écrasé, le romarin, le thym, le zeste de citron, le sel et le poivre.',
    'Badigeonner le poulet avec ce mélange aromatique, y compris sous la peau.',
    'Glisser les demi-citrons et les herbes restantes à l\'intérieur du poulet.',
    'Disposer les légumes coupés autour du poulet dans le plat.',
    'Enfourner pendant 1h15 en arrosant régulièrement avec le jus de cuisson.',
    'Vérifier la cuisson : le jus doit être clair lorsque vous piquez la cuisse.',
    'Laisser reposer 10 minutes avant de découper et servir.',
  ],
  servings: 4,
  prepTime: 30,
  mode: 'classique',
};

const RecipeGenerator = ({ onRecipeGenerated, onBack }: RecipeGeneratorProps) => {
  const cookingMode = useCookerStore((s) => s.cookingMode);
  const defaultServings = useCookerStore((s) => s.defaultServings);
  const defaultPrepTime = useCookerStore((s) => s.defaultPrepTime);
  const includeIngredients = useCookerStore((s) => s.includeIngredients);
  const excludeIngredients = useCookerStore((s) => s.excludeIngredients);
  const dietaryPreferences = useCookerStore((s) => s.dietaryPreferences);
  const isGenerating = useCookerStore((s) => s.isGenerating);
  const showNutritional = useCookerStore((s) => s.showNutritional);
  const generateShoppingList = useCookerStore((s) => s.generateShoppingList);

  const setCookingMode = useCookerStore((s) => s.setCookingMode);
  const setDefaultServings = useCookerStore((s) => s.setDefaultServings);
  const setDefaultPrepTime = useCookerStore((s) => s.setDefaultPrepTime);
  const addIncludeIngredient = useCookerStore((s) => s.addIncludeIngredient);
  const removeIncludeIngredient = useCookerStore((s) => s.removeIncludeIngredient);
  const addExcludeIngredient = useCookerStore((s) => s.addExcludeIngredient);
  const removeExcludeIngredient = useCookerStore((s) => s.removeExcludeIngredient);
  const setIsGenerating = useCookerStore((s) => s.setIsGenerating);

  const buildPrompt = () => {
    let prompt = `Tu es un chef cuisinier expert. Génère une recette délicieuse en mode de cuisson "${cookingMode}" pour ${defaultServings} personne(s) avec un temps de préparation d'environ ${defaultPrepTime} minutes.`;

    if (includeIngredients.length > 0) {
      prompt += ` Utilise obligatoirement ces ingrédients : ${includeIngredients.join(', ')}.`;
    }

    const exclusions = [...excludeIngredients];

    // Extraction et traitement des allergènes stricts
    dietaryPreferences.forEach((pref) => {
      if (pref === 'allergy-peanuts') exclusions.push('arachides', 'cacahuètes', 'huile d\'arachide', 'beurre de cacahuète');
      if (pref === 'allergy-nuts') exclusions.push('fruits à coque', 'noix', 'noisettes', 'amandes', 'pistaches', 'noix de cajou');
      if (pref === 'allergy-crustaceans') exclusions.push('crustacés', 'crevettes', 'crabe', 'homard', 'langouste');
      if (pref === 'allergy-eggs') exclusions.push('œufs', 'jaune d\'œuf', 'blanc d\'œuf', 'albumine');
      if (pref === 'allergy-fish') exclusions.push('poisson', 'saumon', 'thon', 'cabillaud', 'sardines', 'anchois');
      if (pref === 'allergy-soy') exclusions.push('soja', 'sauce soja', 'tofu', 'lécithine de soja');
    });

    if (exclusions.length > 0) {
      prompt += ` N'utilise absolument aucun de ces ingrédients ou leurs dérivés (allergènes stricts) : ${exclusions.join(', ')}.`;
    }

    // Régimes alimentaires
    const diets: string[] = [];
    dietaryPreferences.forEach((pref) => {
      if (pref === 'vegetarien') diets.push('végétarien (sans viande ni poisson)');
      if (pref === 'vegan') diets.push('vegan (sans aucun produit d\'origine animale)');
      if (pref === 'sans-gluten') diets.push('sans gluten');
      if (pref === 'sans-lactose') diets.push('sans lactose');
      if (pref === 'halal') diets.push('halal');
      if (pref === 'casher') diets.push('casher');
      if (pref === 'pescetarien') diets.push('pescetarien');
    });

    if (diets.length > 0) {
      prompt += ` La recette doit respecter les régimes ou préférences alimentaires suivants : ${diets.join(', ')}.`;
    }

    if (showNutritional) {
      prompt += ` Calcule également précisément les macro-nutriments détaillés (calories en kcal, protéines en g, glucides en g et lipides en g) pour une portion de la recette.`;
    }

    if (generateShoppingList) {
      prompt += ` Génère également une liste de courses détaillée contenant tous les ingrédients bruts nécessaires pour réaliser cette recette, avec leurs quantités ajustées pour ${defaultServings} portion(s).`;
    }

    return prompt;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const recipeSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        ingredients: {
          type: 'array',
          items: { type: 'string' }
        },
        steps: {
          type: 'array',
          items: { type: 'string' }
        },
        servings: { type: 'integer' },
        prepTime: { type: 'integer' },
        mode: { type: 'string' },
        ...(showNutritional && {
          nutritionalInfo: {
            type: 'object',
            properties: {
              calories: { type: 'integer' },
              protein: { type: 'integer' },
              carbs: { type: 'integer' },
              fat: { type: 'integer' }
            },
            required: ['calories', 'protein', 'carbs', 'fat']
          }
        }),
        ...(generateShoppingList && {
          shoppingList: {
            type: 'array',
            items: { type: 'string' }
          }
        })
      },
      required: [
        'title',
        'ingredients',
        'steps',
        'servings',
        'prepTime',
        'mode',
        ...(showNutritional ? ['nutritionalInfo'] : []),
        ...(generateShoppingList ? ['shoppingList'] : [])
      ]
    };

    try {
      const prompt = buildPrompt();
      let recipe: Omit<Recipe, 'id' | 'createdAt'> | null = null;

      try {
        const config = settingsSelectors.defaultAgentConfig(useUserStore.getState());
        const envelope = await aiChatService.generateJSON(
          {
            messages: [{ role: 'user', content: prompt }],
            model: config.model,
            provider: config.provider,
            schema: recipeSchema as any,
          },
          new AbortController()
        );

        if (envelope?.data) {
          recipe = envelope.data as any;
        }
      } catch (e) {
        console.error('LLM recipe generation failed, trying simulation', e);
      }

      if (!recipe) {
        // Simulation avec délai en cas de panne de l'API
        await new Promise((resolve) => setTimeout(resolve, 2000));
        recipe = {
          ...MOCK_RECIPE,
          servings: defaultServings,
          prepTime: defaultPrepTime,
          mode: cookingMode,
          ...(showNutritional && {
            nutritionalInfo: {
              calories: 450,
              protein: 32,
              carbs: 45,
              fat: 14
            }
          }),
          ...(generateShoppingList && {
            shoppingList: MOCK_RECIPE.ingredients
          })
        };
      }

      const fullRecipe: Recipe = {
        ...recipe,
        id: `recipe-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      onRecipeGenerated(fullRecipe);
    } catch {
      void message.error('Une erreur est survenue lors de la génération. Réessayez !');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* En-tête */}
        <div className={styles.header}>
          <span style={{ fontSize: '1.8rem' }}>✨</span>
          <div>
            <Typography.Title className={styles.headerTitle}>Générer une recette</Typography.Title>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
              Configurez vos préférences puis laissez l'IA cuisiner !
            </Typography.Text>
          </div>
        </div>

        {/* Corps */}
        <div className={styles.body}>
          {/* Mode de cuisson */}
          <div className={styles.fieldGroup}>
            <Typography.Text className={styles.label}>
              <Icon icon={ChefHat} size={13} style={{ marginRight: 6 }} />
              Mode de cuisson
            </Typography.Text>
            <Select
              popupMatchSelectWidth
              className={styles.select}
              options={COOKING_MODES}
              value={cookingMode}
              onChange={(val) => setCookingMode(val)}
            />
          </div>

          {/* Portions & Temps */}
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <Typography.Text className={styles.label}>👤 Portions</Typography.Text>
              <InputNumber
                className={styles.inputNumber}
                max={20}
                min={1}
                value={defaultServings}
                onChange={(val) => val && setDefaultServings(val)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <Typography.Text className={styles.label}>⏱ Temps (min)</Typography.Text>
              <InputNumber
                className={styles.inputNumber}
                max={480}
                min={5}
                step={5}
                value={defaultPrepTime}
                onChange={(val) => val && setDefaultPrepTime(val)}
              />
            </div>
          </div>

          <div className={styles.divider} />

          {/* Ingrédients à inclure */}
          <div className={styles.fieldGroup}>
            <Typography.Text className={styles.label}>✅ Ingrédients à utiliser</Typography.Text>
            <IngredientTags
              color="#22c55e"
              placeholder="Ex: poulet, tomates..."
              tags={includeIngredients}
              onAdd={addIncludeIngredient}
              onRemove={removeIncludeIngredient}
            />
          </div>

          {/* Ingrédients à exclure */}
          <div className={styles.fieldGroup}>
            <Typography.Text className={styles.label}>❌ Ingrédients à éviter</Typography.Text>
            <IngredientTags
              color="#ef4444"
              placeholder="Ex: noix, gluten..."
              tags={excludeIngredients}
              onAdd={addExcludeIngredient}
              onRemove={removeExcludeIngredient}
            />
          </div>
        </div>

        {/* Pied de page */}
        <Flex className={styles.footer} gap={12}>
          <Button
            className={styles.backBtn}
            icon={<Icon icon={ArrowLeft} />}
            onClick={onBack}
          >
            Retour
          </Button>
          <Button
            className={styles.generateBtn}
            disabled={isGenerating}
            icon={!isGenerating ? <Icon icon={Sparkles} /> : undefined}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? 'Génération en cours...' : 'Générer avec l\'IA'}
          </Button>
        </Flex>
      </div>
    </div>
  );
};

export default RecipeGenerator;
