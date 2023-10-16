import { select } from '@inquirer/prompts';
import { listFolderFiles, printFolderStructure } from './js/utilities.js';
import { handleNegatives } from './js/handleNegatives.js';
import { handleDuplicates } from './js/handleDuplicates.js';
import { handleMissingData } from './js/handleMissingData.js'

async function selectFolder() {
  printFolderStructure();
  const folder = await select({
    message: '\n\nSelect a Folder',
    choices: listFolderFiles('select', './data/')
  });
  return folder;
}

async function selectFile(folder) {
  const fileName = await select({
    message: '\n\nSelect a File',
    choices: listFolderFiles('select', `./data/${folder}`)
  });
  return fileName;
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
        name: 'Handle Missing Data',
        value: 'missing'
      },
      {
        name: 'Handle Duplicates',
        value: 'duplicates'
      },
      {
        name: 'Handle Negatives',
        value: 'negatives'
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
        name: 'Skip the customer record and capture the details',
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
        name: 'Set the value to 0 and capture the details',
        value: 'setToZero'
      }
    ]
  });
  return option;
}

const action = await selectAction();
const folder = await selectFolder();
const fileName = await selectFile(folder)

if (action === 'test') {
  handleMissingData(action, folder, fileName);
  handleDuplicates(action, folder, fileName);
  handleNegatives(action, folder, fileName);
}

if (action === 'missing') {
  const missingDataOption = await selectMissingDataOption();
  handleMissingData(action, folder, fileName, missingDataOption);
}

if (action === 'duplicates') {
  const duplicateDataOption = await selectDuplicateDataOption();
  handleDuplicates(action, folder, fileName, duplicateDataOption);
}

if (action === 'negatives') {
  handleNegatives(action, folder, fileName);
}
