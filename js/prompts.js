import { input, checkbox, select } from '@inquirer/prompts';
import { listFolderFiles, setConfig, fetchFile } from './utilities.js';
import { checkForNegatives } from './checkForNegatives.js';

export async function runNegativesTest(csv) {
  const config = fetchFile()
  // const csv = config.csv;
  // const path = `./data/${csv}`;
  const choice = await select({
    message: `To perform negatives numbers check on ${csv}, select the output type`,
    choices: [
      {
        name: "Get total number negatives",
        value: "count"
      },
      {
        name: "Log all rows with a negative number",
        value: "list"
      },
      {
        name: "New CSV: Set negative numbers to 0 and create a new CSV",
        value: "overwrite"
      },
      {
        name: "Exit",
        value: 'exit'
      }
    ]
  });
  // console.log(choice)
  if (choice === 'exit') {
    return;
  }

  checkForNegatives(csv, choice);
  // runNegativesTest(csv)
}

export default {
  runNegativesTest
};