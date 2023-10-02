import { select } from '@inquirer/prompts';
import { listFolderFiles, setConfig } from './js/utilities.js';
import { checkForNegatives } from './js/checkForNegatives.js';

async function selectCSV() {
  const csv = await select({
    message: '\n\nSelect a CSV',
    choices: listFolderFiles('select')
  });
  const path = './data/raw/'
  setConfig('fileName', csv);
  setConfig('path', path);
}

async function selectAction() {
  const action = await select({
    message: '\n\nWhat action would you like to take?',
    choices: [
      {
        name: 'Run Tests',
        value: 'test'
      },
      {
        name: 'Process a new CSV',
        value: 'process'
      }
    ]
  });
  return action;
}

async function selectMissingDataOption() {
  const option = await select({
    message: '\n\nWhat should be done if a customer record is missing the points value?',
    choices: [
      {
        name: 'Skip the customer record',
        value: 'skipRecord'
      },
      {
        name: 'Set the value to 0',
        value: 'setToZero'
      }
    ]
  });
  return option;
}

async function selectDuplicateDataOption() {
  const option = await select({
    message: '\n\nWhat should be done if a customer record is duplicated and has different point values?',
    choices: [
      {
        name: 'Assign whichever point value is lower',
        value: 'lower'
      },
      {
        name: 'Assign whichever point value is higher',
        value: 'higher'
      },
      {
        name: 'Set the value to 0 and log the details',
        value: 'setToZero'
      }
    ]
  });
  return option;
}

await selectCSV()
const action = await selectAction();
let missingDataOption;
let duplicateDataOption;

if (action === 'process') {
  missingDataOption = await selectMissingDataOption();
  duplicateDataOption = await selectDuplicateDataOption();
}

// console.log(action, missingDataOption, duplicateDataOption);

checkForNegatives(action)