import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";

export async function handleMissingData(action = "test", folder, fileName, option = "skipRecord") {
  let path = `./data/${folder}/${fileName}`;
  let data = [];
  let removed = [];
  let result = [];

  const headersMap = {
    email: "email",
    customerId: "customerId",
    points: "points",
  };
  // parse the csv
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      let requiredHeadersCount = 0;
      for (let key in row) {
        if (key === "email") {
          requiredHeadersCount++;
        }
        if (key === "customerId") {
          requiredHeadersCount++;
        }
        if (key === "points") {
          requiredHeadersCount++;
        }
      };
      if (requiredHeadersCount !== 3) {
        throw new Error("Missing one or more of the follwoing required headers: 'email', 'customerId', 'points'. \n\n If you believe those headers do exist then there was likely in issue with how the CSV was compiled.\n\n");
      }
      data.push(row);
    })
    .on("end", async () => {
      // Checking for duplicates and processing
      for (let i = 0; i < data.length; i++) {
        // console.log(data[i]);
        // console.log('data[i].customerId', data[i]['customerId']);
        // console.log('data[i].email', data[i].email);
        // console.log('!data[i].customerId', !data[i]['customerId']);
        // console.log('!data[i].email', !data[i]['email']);
        // for (let key in data[i]) {
        //   // console.log('key', key, typeof(key));
        //   // console.log('row[key]', data[i][key]);
        //   // console.log(data[i]);
        // };
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
        const createdOrModified = folder === "raw" ? "Created" : "Modified";
        createCsvWriter
          .write(result, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/${fileName}`));
        createCsvWriter
          .write(removed, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/missing_data_${fileName}`));
        console.log(`\n${createdOrModified} file: ${fileName}. It can be found at ./data/modified/${fileName}`)
        console.log(`\nCreated file: missing_data_${fileName}. It can be found at ./data/modified/missing_data_${fileName}\n`)
      } else if (action === "test") {
        if (removed.length === 0) console.log("\nMissing Data Test: Passed\n");
        else {
          console.log("\nMissing Data Test: Failed");
          console.log(`Count of Missing: ${removed.length}\n`);
        }
      }
    });
}

export default {
  handleMissingData,
};
