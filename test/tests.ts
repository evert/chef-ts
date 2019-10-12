import { expect } from 'chai';
import * as fs from 'fs';
import Chef from '../src/chef';

describe('hello-world-souffle', () => {

  it('should print Hello World', () => {

    testProgram(
      'hello-world-souffle.chef',
      'Hello world!',
      'Hello World Souffle.',
    );

  });

});

describe('hello-world-cake', () => {

  it('should print Hello World', () => {

    testProgram(
      'hello-world-cake.chef',
      'Hello world',
      'Hello World Cake with Chocolate sauce.',
    );

  });

});

describe('fibonacci-numbers-with-caramel-source', () => {

  it('should print the first 100 fibonacci numbers', () => {

    const output = [1,1];

    while(output.length < 100) {
      output.push(output[output.length-1] + output[output.length-2]);
    }

    testProgram(
      'hello-world-souffle.chef',
      output.join("\n"),
      'Fibonacci Numbers with Caramel Sauce.'
    );

  });

});


function testProgram(filename: string, expectedOutput: string, title: string) {

  const program = fs.readFileSync(__dirname + '/' + filename, 'utf-8');

  const chef = new Chef(program);

  expect(chef.title).to.eql(title);

  const output = chef.run();
  expect(output).to.eql(expectedOutput);

}
