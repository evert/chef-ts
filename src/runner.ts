import { Stack, Statement, IngredientMap } from './types';

export default class Runner {

  private mixingBowls: Stack[];
  private bakingDishes: Stack[];
  private statements: Statement[];
  public ingredients: IngredientMap;

  constructor(ingredients: IngredientMap, statements: Statement[]) {

    this.ingredients = ingredients;
    this.statements = statements;

  }

  run(mixingBowls: Stack[], bakingDishes: Stack[]): Stack {

    this.mixingBowls = mixingBowls;
    this.bakingDishes = bakingDishes;
    this.executeStatements(this.statements);
    return this.getMixingBowl(0);

  }

  private getMixingBowl(index?: number | string): Stack {

    if (typeof index === 'string') {
      index = parseInt(index, 10);
    }
    if (!index) index = 0;
    if (!this.mixingBowls[index]) {
      this.mixingBowls[index] = {
        ingredients: []
      }
    }

    return this.mixingBowls[index];
  }

  getBakingDish(index?: number | string): Stack {

    if (typeof index === 'string') {
      index = parseInt(index, 10);
    }
    if (!index) index = 0;
    if (!this.bakingDishes[index]) {
      this.bakingDishes[index] = {
        ingredients: []
      }
    }

    return this.bakingDishes[index];
  }

  private executeStatements(statements: Statement[]) {

    for(let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      switch(statement[0]) {
        case 'Combine' :
          this.verbCombine(statement[1]);
          break;
        case 'Liquefy' :
        case 'Liquify' :
          this.verbLiquify(statement[1]);
          break;
        case 'Pour' :
          this.verbPour(statement[1]);
          break;
        case 'Put' :
          this.verbPut(statement[1]);
          break;
        case 'Stir' :
          this.verbStir(statement[1]);
          break;
        default :
          const matches = statement[1].match(/^the (.*)$/);
          if (matches) {
            // Loop!
            const ingredient = this.ingredients.get(matches[1])!;
            
            const verb = statement[0];

            // Find end of loop
            let i2 = i+1;
            let untilIngredient = null;
            while(true) {

              if (statements.length <= i2) {
                throw new Error('Could not find end of loop');
              }
              const re = '^(.*\\s)?until ' + verb.toLowerCase() + 'd$'
              const matches2 = statements[i2][1].match(new RegExp(re));
              if (matches2) {
                // Found end of loop
                if (matches2[1]) {
                  untilIngredient = matches2[1];
                }
                break;
              }
              i2++;
            }

            if (i2-i > 1) {
              throw new Error('We don\'t support statements inside loops yet');
            }
            if (untilIngredient!==null) {
              throw new Error('We don\'t support untilIngredients yet');
            }

            if (ingredient.value !== 0) {
              do {
              } while(ingredient.value !== 0);
            }
            // Advance the pointer
            i = i2;

          } else {
            throw new Error('Unknown statement: ' + statement.join(' '));
          }
          break;
      }

    }
       
  }

  private verbPut(statement: string) {

    const matches = statement.match(/^(.*) into (?:the\s)?(?:([\d])(?:th|nd|rd)\s)?mixing bowl$/);
    if (!matches) {
      throw new Error('Bad PUT statement: ' + statement);
    }

    const ingredientName = matches[1];

    const ingredient = this.ingredients.get(ingredientName);
    if (!ingredient) {
      throw new Error('Unknown ingredient: ' + ingredientName);
    }

    const bowl = this.getMixingBowl(matches[2]);
    bowl.ingredients.push(
      Object.assign({}, ingredient)
    );

  }

  private verbStir(statement: string) {

    const matches = statement.match(/^(?:the (?:(\d)(?:th|rd|nd)\s)?mixing bowl\s)?for (\d) minute(s)?$/);
    if (!matches) {
      throw new Error('Bad Stir statement: Stir ' + statement);
    }

    const bowl = this.getMixingBowl(matches[1]);
    const length = parseInt(matches[2], 10);

    if (length > bowl.ingredients.length) {
      bowl.ingredients = [
        bowl.ingredients[bowl.ingredients.length-1],
        ...bowl.ingredients.slice(0, bowl.ingredients.length - 1)
      ]
    } else {
      bowl.ingredients = [
        ...bowl.ingredients.slice(0, length),
        bowl.ingredients[bowl.ingredients.length - 1],
        ...bowl.ingredients.slice(length, bowl.ingredients.length -1)
      ];
    }

  }

  private verbCombine(statement: string) {

    const matches = statement.match(/^(.*)(?: into (?:the\s)?(?:(\d)(?:th|rd|nd)\s)?mixing bowl)$/);
    if (!matches) {
      throw new Error('Bad Combine statement: Combine ' + statement);
    }
    const ingredient1 = this.ingredients.get(matches[1])!;
    const bowl = this.getMixingBowl(matches[2]);
    bowl.ingredients.push(
      {
        name: ingredient1.name,
        value: ingredient1.value! * bowl.ingredients[bowl.ingredients.length-1].value!,
        type: ingredient1.type,
      }
    );

  }

  private verbLiquify(statement: string) {

    if (statement.endsWith('mixing bowl')) {

      const matches = statement.match(/^(?:the\s)?contents of the (?:(\d)(?:th|rd|nd)\s)?mixing bowl$/);
      if (!matches) {
        throw new Error('Bad statement: Liquify ' + statement);
      }
      const bowl = this.getMixingBowl(matches[1]);
      for(const ingredient of bowl.ingredients) {
        ingredient.type = 'liquid';
      }

    } else {
      throw new Error('Bad statement: Liquify ' + statement);
    }

  }

  private verbPour(statement: string) {

    const matches = statement.match(/^contents of (?:the\s)?(?:(\d)(?:th|rd|nd)\s)?mixing bowl into (?:the\s)?(?:(\d)(?:th|rd|nd)\s)?baking dish$/);
    if (!matches) {
      throw new Error('Bad statement: Pour ' + statement);
    }
    const bowl = this.getMixingBowl(matches[1]);
    const dish = this.getBakingDish(matches[2]);
    dish.ingredients.push(...bowl.ingredients);

  }
}
