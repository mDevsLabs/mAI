'use client';

import { Button, Card, Checkbox, Divider, Form, InputNumber, message,Select, Switch, Typography } from 'antd';
import { createStaticStyles } from 'antd-style';
import { ChefHat, Clock, Flame,Leaf, Users, UtensilsCrossed } from 'lucide-react';
import { useEffect,useState } from 'react';

import { useCookerStore } from '@/features/Cooker/store/useCookerStore';

const useStyles = createStaticStyles(({ css }) => ({
  container: css`
    width: 100%;
    max-width: 720px;
  `,
  card: css`
    margin-bottom: 16px;
    border-radius: 12px;
  `,
  cardTitle: css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 15px;
  `,
  formItem: css`
    margin-bottom: 16px;
  `,
  description: css`
    font-size: 12px;
    color: rgba(128, 128, 128, 0.8);
    margin-top: 4px;
  `,
  betaBadge: css`
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-left: 8px;
  `,
  tagInput: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--ant-color-border);
    border-radius: 8px;
    min-height: 48px;
    align-items: center;
    cursor: text;
  `,
  tag: css`
    background: var(--ant-color-primary-bg);
    color: var(--ant-color-primary);
    border: 1px solid var(--ant-color-primary-border);
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover {
      background: var(--ant-color-error-bg);
      color: var(--ant-color-error);
      border-color: var(--ant-color-error-border);
    }
  `,
  excludeTag: css`
    background: var(--ant-color-error-bg);
    color: var(--ant-color-error);
    border: 1px solid var(--ant-color-error-border);
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
  `,
  inputInline: css`
    border: none;
    outline: none;
    background: transparent;
    font-size: 12px;
    width: 120px;
    padding: 2px 4px;
  `,
  checkboxGrid: css`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  `,
}));

const COOKING_MODES = [
  { label: '🍳 Classique (four, poêle, casserole)', value: 'classique' },
  { label: '🤖 Thermomix (adapté)', value: 'thermomix' },
  { label: '💨 Air Fryer (friteuse à air)', value: 'airfryer' },
  { label: '♨️ Vapeur (cuiseur vapeur)', value: 'vapeur' },
  { label: '🫕 Cocotte-Minute (autocuiseur)', value: 'cocotte' },
];

const DIETARY_OPTIONS = [
  { label: '🥗 Végétarien', value: 'vegetarien' },
  { label: '🌱 Vegan', value: 'vegan' },
  { label: '🌾 Sans Gluten', value: 'sans-gluten' },
  { label: '🥛 Sans Lactose', value: 'sans-lactose' },
  { label: '🌙 Halal', value: 'halal' },
  { label: '✡️ Casher', value: 'casher' },
  { label: '🐟 Pescétarien', value: 'pescetarien' },
  { label: '💪 Riche en protéines', value: 'high-protein' },
];

const ALLERGEN_OPTIONS = [
  { label: '🥜 Arachides', value: 'allergy-peanuts' },
  { label: '🌰 Fruits à coque', value: 'allergy-nuts' },
  { label: '🦞 Crustacés', value: 'allergy-crustaceans' },
  { label: '🥚 Œufs', value: 'allergy-eggs' },
  { label: '🐟 Poisson', value: 'allergy-fish' },
  { label: '🌱 Soja', value: 'allergy-soy' },
];

interface TagsInputProps {
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
  tags: string[];
  variant?: 'include' | 'exclude';
}

const TagsInput = ({ tags, onAdd, onRemove, placeholder = 'Ajouter...', variant = 'include' }: TagsInputProps) => {
  const { styles } = useStyles();
  const [inputVal, setInputVal] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
      e.preventDefault();
      onAdd(inputVal.trim());
      setInputVal('');
    }
    if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
      onRemove(tags.at(-1));
    }
  };

  return (
    <div className={styles.tagInput}>
      {tags.map((tag) => (
        <span
          className={variant === 'exclude' ? styles.excludeTag : styles.tag}
          key={tag}
          title="Cliquer pour supprimer"
          onClick={() => onRemove(tag)}
        >
          {tag} ×
        </span>
      ))}
      <input
        className={styles.inputInline}
        placeholder={placeholder}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputVal.trim()) {
            onAdd(inputVal.trim());
            setInputVal('');
          }
        }}
      />
    </div>
  );
};

const CookerSettingsPage = () => {
  const { styles } = useStyles();

  const defaultServings = useCookerStore((s) => s.defaultServings);
  const cookingMode = useCookerStore((s) => s.cookingMode);
  const defaultPrepTime = useCookerStore((s) => s.defaultPrepTime);
  const includeIngredients = useCookerStore((s) => s.includeIngredients);
  const excludeIngredients = useCookerStore((s) => s.excludeIngredients);
  const dietaryPreferences = useCookerStore((s) => s.dietaryPreferences);

  const setDefaultServings = useCookerStore((s) => s.setDefaultServings);
  const setCookingMode = useCookerStore((s) => s.setCookingMode);
  const setDefaultPrepTime = useCookerStore((s) => s.setDefaultPrepTime);
  const addIncludeIngredient = useCookerStore((s) => s.addIncludeIngredient);
  const removeIncludeIngredient = useCookerStore((s) => s.removeIncludeIngredient);
  const addExcludeIngredient = useCookerStore((s) => s.addExcludeIngredient);
  const removeExcludeIngredient = useCookerStore((s) => s.removeExcludeIngredient);
  const toggleDietaryPreference = useCookerStore((s) => s.toggleDietaryPreference);
  const syncWithServer = useCookerStore((s) => s.syncWithServer);

  const showNutritional = useCookerStore((s) => s.showNutritional);
  const generateShoppingList = useCookerStore((s) => s.generateShoppingList);
  const setShowNutritional = useCookerStore((s) => s.setShowNutritional);
  const setGenerateShoppingList = useCookerStore((s) => s.setGenerateShoppingList);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    syncWithServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await syncWithServer();
      message.success('Préférences et recettes Cooker synchronisées avec le serveur !');
    } catch {
      message.error('Erreur lors de la synchronisation.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        <ChefHat size={22} style={{ marginRight: 8, verticalAlign: 'middle' }} />
        Paramètres Cooker
        <span className={styles.betaBadge}>BÊTA</span>
      </Typography.Title>
      <Typography.Text style={{ display: 'block', marginBottom: 24 }} type="secondary">
        Personnalisez votre assistant culinaire IA pour des recettes adaptées à vos besoins.
      </Typography.Text>

      {/* Bloc Portions et Temps */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Users size={16} />
            Portions et Temps
          </div>
        }
      >
        <Form.Item
          extra="Nombre de personnes pour lesquelles la recette sera générée."
          label="Nombre de portions par défaut"
          style={{ marginBottom: 16 }}
        >
          <InputNumber
            addonAfter="personnes"
            max={20}
            min={1}
            style={{ width: 120 }}
            value={defaultServings}
            onChange={(v) => setDefaultServings(v ?? 4)}
          />
        </Form.Item>

        <Form.Item
          extra="Durée maximale de préparation souhaitée en minutes."
          label="Temps de préparation par défaut"
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            addonAfter="min"
            max={240}
            min={5}
            step={5}
            style={{ width: 140 }}
            value={defaultPrepTime}
            onChange={(v) => setDefaultPrepTime(v ?? 30)}
          />
        </Form.Item>
      </Card>

      {/* Bloc Mode de Cuisson */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Flame size={16} />
            Mode de Cuisson
          </div>
        }
      >
        <Form.Item
          extra="Adapte les instructions selon votre équipement de cuisine principal."
          label="Mode par défaut"
          style={{ marginBottom: 0 }}
        >
          <Select
            options={COOKING_MODES}
            style={{ width: '100%' }}
            value={cookingMode}
            onChange={setCookingMode}
          />
        </Form.Item>
      </Card>

      {/* Bloc Ingrédients */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <UtensilsCrossed size={16} />
            Ingrédients
          </div>
        }
      >
        <div className={styles.formItem}>
          <Form.Item
            label="🟢 Ingrédients à privilégier"
            style={{ marginBottom: 8 }}
          >
            <TagsInput
              placeholder="Tomate, poulet, riz... (Entrée pour ajouter)"
              tags={includeIngredients}
              variant="include"
              onAdd={addIncludeIngredient}
              onRemove={(tag) => {
                const idx = includeIngredients.indexOf(tag);
                if (idx !== -1) removeIncludeIngredient(idx);
              }}
            />
          </Form.Item>
          <p className={styles.description}>
            Ces ingrédients seront prioritairement inclus dans vos recettes générées.
          </p>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className={styles.formItem}>
          <Form.Item
            label="🔴 Ingrédients à exclure"
            style={{ marginBottom: 8 }}
          >
            <TagsInput
              placeholder="Gluten, noix, fruits de mer... (Entrée)"
              tags={excludeIngredients}
              variant="exclude"
              onAdd={addExcludeIngredient}
              onRemove={(tag) => {
                const idx = excludeIngredients.indexOf(tag);
                if (idx !== -1) removeExcludeIngredient(idx);
              }}
            />
          </Form.Item>
          <p className={styles.description}>
            Ces ingrédients ne seront jamais utilisés dans les recettes générées (allergènes, intolérances).
          </p>
        </div>
      </Card>

      {/* Bloc Allergènes stricts */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <UtensilsCrossed size={16} style={{ color: 'var(--ant-color-error)' }} />
            Allergènes stricts (Exclusion totale)
          </div>
        }
      >
        <Form.Item label="Allergènes majeurs à éliminer" style={{ marginBottom: 0 }}>
          <div className={styles.checkboxGrid}>
            {ALLERGEN_OPTIONS.map((opt) => (
              <Checkbox
                checked={dietaryPreferences.includes(opt.value)}
                key={opt.value}
                onChange={() => toggleDietaryPreference(opt.value)}
              >
                {opt.label}
              </Checkbox>
            ))}
          </div>
        </Form.Item>
      </Card>

      {/* Bloc Régime Alimentaire */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Leaf size={16} />
            Régime Alimentaire
          </div>
        }
      >
        <Form.Item label="Préférences alimentaires" style={{ marginBottom: 0 }}>
          <div className={styles.checkboxGrid}>
            {DIETARY_OPTIONS.map((opt) => (
              <Checkbox
                checked={dietaryPreferences.includes(opt.value)}
                key={opt.value}
                onChange={() => toggleDietaryPreference(opt.value)}
              >
                {opt.label}
              </Checkbox>
            ))}
          </div>
        </Form.Item>
      </Card>

      {/* Bloc Options */}
      <Card
        className={styles.card}
        title={
          <div className={styles.cardTitle}>
            <Clock size={16} />
            Options supplémentaires
          </div>
        }
      >
        <Form.Item
          extra="Inclure calories, protéines, glucides et lipides dans chaque recette."
          label="Afficher les informations nutritionnelles"
          style={{ marginBottom: 12 }}
        >
          <Switch checked={showNutritional} onChange={setShowNutritional} />
        </Form.Item>

        <Form.Item
          extra="Créer une liste d'achats à partir de la recette générée."
          label="Générer automatiquement la liste de courses"
          style={{ marginBottom: 0 }}
        >
          <Switch checked={generateShoppingList} onChange={setGenerateShoppingList} />
        </Form.Item>
      </Card>

      <Button
        loading={isSaving}
        size="large"
        style={{ width: '100%', borderRadius: 8, height: 44 }}
        type="primary"
        onClick={handleSave}
      >
        Enregistrer et synchroniser les paramètres
      </Button>
    </div>
  );
};

CookerSettingsPage.displayName = 'CookerSettingsPage';

export default CookerSettingsPage;
