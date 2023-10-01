import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";
import { setConfig, fetchFile } from './utilities.js';


export function checkForNegatives(action = "test", newFileName) {
  // action types: list, test, process
  const config = fetchFile();
  let fileName = config.fileName;
  let path = config.path;
  let data = [];
  let totalNegative = 0;
  fs.createReadStream(`${path}${fileName}`)
    .pipe(csv())
    .on("data", (row) => {
      if (Number(row.points) < 0) {
        totalNegative += 1;
        switch (action) {
          case "list":
            data.push(row);
            break;
          case "process":
            row.points = 0;
            data.push(row);
            break;
        }
      } else {
        if (action === "process") data.push(row); // push unchanged row if action is process
      }
    })
    .on("end", () => {
      if (totalNegative === 0) {
        console.log("\nNegatives Test: Passed\n");
      } else {
        switch (action) {
          case "list":
            console.log('\n\n', data);
            break;
          case "process":
            path = './data/modified/'
            fileName = newFileName ? newFileName : `modified_${fileName}`;
            const fullPath = `${path}${fileName}`;
            const csvWriter = createCsvWriter.writeToPath(
              fullPath,
              data,
              { headers: true }
            ); // this creates a new csv file with modified data
            console.log("New CSV file created with all negatives overwritten.");
            setConfig('fileName', fileName);
            setConfig('path', path);
            break;
          case "test":
            console.log("\nNegatives Test: Failed");
            console.log(
              `Negatives total: ${totalNegative}\n`
            );
            break;
        }
      }
    });
}

export default {
  checkForNegatives,
};
