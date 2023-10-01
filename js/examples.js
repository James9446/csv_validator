import { input, checkbox, select, Separator, editor } from '@inquirer/prompts';

const name = await input({ message: 'Enter your name' });

console.log(name)


const seletions = await checkbox({
  message: 'Use the space bar to select',
  choices: [
    { name: 'first', value: 'first' },
    { name: 'second', value: 'second' },
    new Separator(),
    { name: 'third', value: 'third', disabled: 'not availabe' },
  ],
});
console.log(seletions)

const answer = await select({
    message: 'Select a package manager',
    choices: [
      {
        name: 'item_0',
        value: 'item_0',
        description: 'item_0 is an option',
      },
      {
        name: 'item_1',
        value: 'item_1',
        description: 'item_1 is an another option',
      },
      new Separator(),
      {
        name: 'item_2',
        value: 'item_2',
        disabled: true,
      },
      {
        name: 'pnpm',
        value: 'pnpm',
        disabled: '(pnpm is not available)',
      },
    ],
  });

  console.log(answer)