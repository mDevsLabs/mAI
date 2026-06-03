import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { lambdaClient } from '@/libs/trpc/client';

export interface Recipe {
  createdAt: string;
  id: string;
  ingredients: string[];
  mode: string;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTime: number;
  servings: number;
  shoppingList?: string[];
  steps: string[];
  title: string;
}

export type CookingMode = 'classique' | 'thermomix' | 'airfryer' | 'vapeur' | 'cocotte';

export interface CookerState {
  // Actions - Ingrédients à exclure
  addExcludeIngredient: (ingredient: string) => void;
  // Actions - Ingrédients à inclure
  addIncludeIngredient: (ingredient: string) => void;
  clearCurrentRecipe: () => void;

  cookingMode: CookingMode;
  currentRecipe: Recipe | null;

  defaultPrepTime: number;

  // Préférences de base
  defaultServings: number;
  deleteRecipe: (id: string) => Promise<void>;

  // Préférences alimentaires
  dietaryPreferences: string[];

  excludeIngredients: string[];
  generateShoppingList: boolean;
  // Ingrédients
  includeIngredients: string[];

  // État de génération
  isGenerating: boolean;
  removeExcludeIngredient: (index: number) => void;

  removeIncludeIngredient: (index: number) => void;
  saveCurrentRecipe: () => Promise<void>;

  // Recettes
  savedRecipes: Recipe[];

  setCookingMode: (mode: CookingMode) => void;
  // Actions - Recettes
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setDefaultPrepTime: (time: number) => void;
  // Actions - Préférences
  setDefaultServings: (servings: number) => void;
  setGenerateShoppingList: (val: boolean) => void;

  // Actions - État
  setIsGenerating: (isGenerating: boolean) => void;

  setShowNutritional: (val: boolean) => void;
  // Nouvelles Options Cooker
  showNutritional: boolean;
  syncWithServer: () => Promise<void>;
  // Actions - Préférences alimentaires
  toggleDietaryPreference: (preference: string) => void;
}

export const useCookerStore = create<CookerState>()(
  persist(
    (set, get) => ({
      // Valeurs par défaut
      defaultServings: 4,
      cookingMode: 'classique',
      defaultPrepTime: 30,
      showNutritional: true,
      generateShoppingList: false,

      includeIngredients: [],
      excludeIngredients: [],
      dietaryPreferences: [],

      savedRecipes: [],
      currentRecipe: null,
      isGenerating: false,

      // Actions - Préférences
      setDefaultServings: (servings) => set({ defaultServings: servings }),
      setCookingMode: (mode) => set({ cookingMode: mode }),
      setDefaultPrepTime: (time) => set({ defaultPrepTime: time }),
      setShowNutritional: (val) => set({ showNutritional: val }),
      setGenerateShoppingList: (val) => set({ generateShoppingList: val }),

      // Actions - Ingrédients à inclure
      addIncludeIngredient: (ingredient) => {
        const { includeIngredients } = get();
        const trimmed = ingredient.trim();
        if (trimmed && !includeIngredients.includes(trimmed)) {
          set({ includeIngredients: [...includeIngredients, trimmed] });
        }
      },
      removeIncludeIngredient: (index) => {
        const { includeIngredients } = get();
        set({ includeIngredients: includeIngredients.filter((_, i) => i !== index) });
      },

      // Actions - Ingrédients à exclure
      addExcludeIngredient: (ingredient) => {
        const { excludeIngredients } = get();
        const trimmed = ingredient.trim();
        if (trimmed && !excludeIngredients.includes(trimmed)) {
          set({ excludeIngredients: [...excludeIngredients, trimmed] });
        }
      },
      removeExcludeIngredient: (index) => {
        const { excludeIngredients } = get();
        set({ excludeIngredients: excludeIngredients.filter((_, i) => i !== index) });
      },

      // Actions - Préférences alimentaires
      toggleDietaryPreference: (preference) => {
        const { dietaryPreferences } = get();
        if (dietaryPreferences.includes(preference)) {
          set({ dietaryPreferences: dietaryPreferences.filter((p) => p !== preference) });
        } else {
          set({ dietaryPreferences: [...dietaryPreferences, preference] });
        }
      },

      // Actions - Recettes
      setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
      clearCurrentRecipe: () => set({ currentRecipe: null }),

      saveCurrentRecipe: async () => {
        const { currentRecipe, savedRecipes } = get();
        if (!currentRecipe) return;

        const exists = savedRecipes.some((r) => r.id === currentRecipe.id);
        if (!exists) {
          set({ savedRecipes: [currentRecipe, ...savedRecipes] });
          try {
            await lambdaClient.cooker.createRecipe.mutate(currentRecipe);
          } catch (e) {
            console.error('Failed to save recipe to server', e);
          }
        }
      },

      deleteRecipe: async (id) => {
        const { savedRecipes } = get();
        set({ savedRecipes: savedRecipes.filter((r) => r.id !== id) });
        try {
          await lambdaClient.cooker.deleteRecipe.mutate({ id });
        } catch (e) {
          console.error('Failed to delete recipe from server', e);
        }
      },

      syncWithServer: async () => {
        try {
          const res = await lambdaClient.cooker.getRecipes.query();
          if (res?.success && res.recipes) {
            set({ savedRecipes: res.recipes as Recipe[] });
          }
        } catch (e) {
          console.error('Failed to sync cooker recipes with server', e);
        }
      },

      // Actions - État
      setIsGenerating: (isGenerating) => set({ isGenerating }),
    }),
    {
      name: 'cooker-storage-v0.1.4',
    }
  )
);
