export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  macros: MacroNutrients;
  timestamp: number;
  imageUrl?: string;
  confidence?: string;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS'
}
