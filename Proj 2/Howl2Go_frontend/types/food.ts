// Shared types for food items and API responses

export interface mockSearchResults {
  [key: string]: string;
}
export interface FoodItem {
  restaurant: string;
  item: string;
  calories: number;
  caloriesFromFat: number | null;
  totalFat: number | null;
  saturatedFat: number | null;
  transFat: number | null;
  cholesterol: number | null;
  sodium: number | null;
  carbs: number | null;
  fiber: number | null;
  sugars: number | null;
  protein: number | null;
  weightWatchersPoints: number | null;
}

export interface APIResponse {
  results?: FoodItem[];
  error?: string;
  message?: string;
}

export interface APIError {
  message: string;
  statusCode?: number;
}
