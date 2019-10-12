export type MeasureType = 'heaped' | 'level';
export type Measure = 'g' | 'kg' | 'pinch' | 'ml' | 'l' | 'dash' | 'cup' | 'teaspoon' | 'tablespoon';

export type IngredientType = 'dry' | 'liquid' | 'either';

export type Ingredient = {
  name: string
  value?: number,
  type: IngredientType,
}

export type IngredientMap = Map<string, Ingredient>;

export type Statement = [string, string]

export type Stack = {
  ingredients: Ingredient[],
}
