import { Ingredient, IngredientMap, IngredientType, Statement } from './types';
import Runner from './runner';

export default class Chef {

  private program: string;
  private offset: number;

  public title: string;
  public preHeat: string;
  public serves: number;
  public functions: Map<string, Runner>;

  constructor(program: string) {

    this.program = program;
    this.offset = 0;
    this.functions = new Map();
    this.parse();

  }

  run(): string {

    const main = this.functions.get('main')!;
    main.run([], []);
    let output = '';
    for(let ii=0; ii < this.serves; ii++) {
      const bakingDish = main.getBakingDish(ii);

      while(true) {
        let ingredient = bakingDish.ingredients.pop();
        if (!ingredient) {
          break;
        }
        switch(ingredient.type) {
          case 'liquid' :
            if (!ingredient.value) {
              throw new Error('Can\'t output an undefined ingedient');
            }
            output += String.fromCodePoint(ingredient.value);
            break;
          default :
            throw new Error('cant print type '  + ingredient.type);
        }
      }
    }
    return output;

  }

  parse() {

    const [title, runner] = this.parseFunction();
    this.title = title;
    this.functions.set('main', runner);

    this.skipEmptyLines();

    this.serves = this.parseServes();

    while (!this.eof()) {
      const [name, runner] = this.parseFunction();
      this.functions.set(name, runner);
      this.skipEmptyLines();
    }

  }

  private parseFunction(): [string, Runner] {

    const title = this.readLine();

    let line = this.readLine();
    while (line !== 'Ingredients.') {
      line = this.readLine();
    }
    const ingredients = this.parseIngredients();

    this.skipEmptyLines();
    line = this.readLine();
    while (line !== 'Method.') {
      line = this.readLine();
    }

    const runner = new Runner(
      ingredients,
      this.parseStatements()
    );

    return [title, runner];

  }

  private parseIngredients(): IngredientMap {

    let line = this.readLine();
    const output: IngredientMap = new Map(); 

    while(line !== '') {

      const match = line.match(/^(?:(\d+)\s)?(?:(heaped|level)\s)?(?:(g|kg|pinch|pinches|ml|l|dash|dashes|cup|cups|teaspoon|teaspoons|tablespoon|tablespoons)\s)?(.*)$/);
      if (!match) {
        throw new Error('Invalid ingredient: ' + line);
      }


      let type: IngredientType;

      if (match[3]) {
        switch(match[3]) {
          case 'g' :
          case 'kg' :
          case 'pinch' :
          case 'pinches' :
            type = 'dry';
            break;

          case 'ml' :
          case 'l' :
          case 'dash' :
          case 'dashes' :
            type = 'liquid';
            break;

          case 'cup' :
          case 'cups' :
          case 'teaspoon' :
          case 'teaspoons' :
          case 'tablespoon' :
          case 'tablespoons' :
            type = 'either';
            break;
          default :
            throw new Error('Unknown measure: ' + match[3]);
        }
      }

      const ingredient: Ingredient = {
        value: match[1] ? parseInt(match[1], 10) : undefined,
        name: match[4],
        type: type!
      };

      if (match[2]) {
        switch(match[2]) {
          case 'heaped' :
          case 'level' :
            ingredient.type = 'dry';;
            break;
          default :
            throw new Error('Unknown measure type: ' + match[2]);
        }
      }

      output.set(ingredient.name, ingredient);
      line = this.readLine();

    }

    return output;

  }

  private parseStatements(): Statement[] {

    const result:Statement[] = [];

    let line = this.readLine();

    while(line!=='') {
      
      const lineParts = line.split('.');
      for(const part of lineParts) {
        if (!part) {
          continue;
        }
        const verb = part.trim().split(' ')[0];
        const rest = part.substr(verb.length + 1);
        result.push([verb.trim(), rest.trim()]);
      }
      line = this.readLine();

    }

    return result;

  }

  private parseServes(): number {

    const line = this.readLine();
    const matches = line.match(/^Serves (\d+).$/);
    if (!matches) {
      throw new Error('Unknown line: ' + line);
    }
    return parseInt(matches[1], 10);

  }

  private readLine() {

    const line = this.readUntil("\n");
    this.forward(1);
    return line;

  }

  private readUntil(str: string) {

    const line = this.program.substr(
      this.offset,
      this.program.indexOf(
        str,
        this.offset
      ) - this.offset
    );
    this.offset+=line.length;
    return line;

  }

  /**
   * Move the cursor n positions forward
   */
  private forward(length: number) {
    this.offset += length;
  }

  private skipEmptyLines() {

    while (this.program[this.offset] === "\n") {
      this.offset++;
    }

  }

  private eof() {

    return this.offset >= this.program.length-1;

  }

}
