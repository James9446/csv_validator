import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";

export async function handleMissingData(action = "test", folder, fileName, option = "skipRecord") {
  let path = `./data/${folder}/${fileName}`;
  let data = [];
  let removed = [];
  let result = [];

  // parse the csv
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", async () => {
      // Checking for duplicates and processing
      for (let i = 0; i < data.length; i++) {
        
        if (!data[i].customerId && !data[i].email) {
          removed.push({...data[i], data_issue: "Missing the email and customerId"});
          continue;
        };

        if (!data[i].customerId) {
          removed.push({...data[i], data_issue: "Missing the customerId"});
          continue;
        };

        if (!data[i].email) {
          removed.push({...data[i], data_issue: "Missing the email"});
          continue;
        };

        if (!data[i].points) {
          if (option === 'skipRecord') {
            removed.push({...data[i], data_issue: "Missing the points"});
            continue;
          };
          if (option === 'setToZero') {
            data[i].points = 0
          };
        };

        result.push(data[i]);     
      }


      // Based on 'action' parameter decide whether to write to a new csv or console log the status
      if (action === "missing") {
        createCsvWriter
          .write(result, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/${fileName}`));
        createCsvWriter
          .write(removed, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/missing_data_${fileName}.csv`));
      } else if (action === "test") {
        if (removed.length === 0) console.log("\nMissing Data Test: Passed\n");
        else {
          console.log("\nMissing Test: Failed");
          console.log(`Count of Missing: ${removed.length}\n`);
        }
      }
    });
}

export default {
  handleMissingData,
};
