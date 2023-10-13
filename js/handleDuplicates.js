import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";

export async function handleDuplicates(action = "test", folder, fileName, option = "lower") {
  let path = `./data/${folder}/${fileName}`;
  let data = [];
  let stagedData = {};
  let customerIdReference = {};
  let emailReference = {};
  let flagged = {
    emails: [],
    customerIds: []
  }
  let removed = [];
  let result = [];

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
        let key = data[i].customerId + data[i].email;

        if (stagedData[key] && stagedData[key].points === data[i].points) {
          // record is an exact match and doesn't need to be logged; it should just be skipped
          // *note this currently does not account for potential discrepancy for expirtationDate
          continue;
        }

        if (flagged.customerIds.includes(data[i].customerId)) {
          removed.push({...data[i], data_issue: "This record is duplicated. The customerId is associated with multiple email values.",});
          continue;
        }

        if (flagged.emails.includes(data[i].email)) {
          removed.push({...data[i], data_issue: "This record is duplicated. The email is associated with multiple customerId values.",});
          continue;
        }

        // Check if one customerId is associated with multiple email values
        if (customerIdReference[data[i].customerId] && customerIdReference[data[i].customerId] !== data[i].email) {
          const message = "This record is duplicated. The customerId is associated with multiple email values."
          removed.push({...data[i], data_issue: message,});

          // if a duplicate is found then the row it matched again needs to be removed from stagedData too
          for (let key in stagedData) {
            if (stagedData[key].customerId === data[i].customerId) {
              // flag the customerId in case this value is seen again
              flagged.customerIds.push(data[i].customerId);
              // flag the email in case this value is seen again
              flagged.emails.push(data[i].email);
              removed.push({...stagedData[key], data_issue: message,});
              delete stagedData[key];
            }
          }
          continue;
        }
        customerIdReference[data[i].customerId] = data[i].email;

        // Check if one email is associated with multiple customerId values
        if (emailReference[data[i].email] && emailReference[data[i].email] !== data[i].customerId) {
          const message = "This record is duplicated. The email is associated with multiple customerId values.";
          removed.push({...data[i], data_issue: message,});

          // if a duplicate is found then the row it matched again needs to be removed from stagedData too
          for (let key in stagedData) {
            if (stagedData[key].email === data[i].email) {
              // flag the customerId in case this value is seen again
              flagged.customerIds.push(data[i].customerId);
              // flag the email in case this value is seen again
              flagged.emails.push(data[i].email);
              removed.push({...stagedData[key], data_issue: message,});
              delete stagedData[key];
            }
          }
          continue;
        }
        emailReference[data[i].email] = data[i].customerId;

        // Continue with existing procedure for duplicates with same customerId & email
        // key defined at top of for loop
        if (stagedData[key]) {
          let message;
          if (option === 'lower') {
            message = "The points value was set to the lower amount";
          } 
          if (option === 'higher') {
            message = "The points value was set to the higher amount";
          }
          if (option === 'setToZero') {
            message = "The points value was set to 0";
          }
          removed.push({...data[i], data_issue: `A points discrepancy was found. ${message}`,});
          switch (option) {
            case "lower":
              if (data[i].points < stagedData[key].points) {
                // replace with record of lower value (may have a different expiration date)
                stagedData[key] = data[i];
              }
              break;
            case "higher":
              if (data[i].points > stagedData[key].points) {
                // replace with record of higher value (may have a different expiration date)
                stagedData[key] = data[i];
              }
              break;
            case "setToZero":
              // set the points to 0
              stagedData[key].points = 0;
              break;
            default:
              break;
          }
        } else stagedData[key] = data[i];
      }

      for (let key in stagedData) {
        // double-check there are no customerIds that were flagged 
        if (flagged.customerIds.includes(stagedData[key].customerId)) {
          removed.push({...stagedData[key], data_issue: "This record is duplicated. The customerId is associated with multiple email values.",});
          continue;
        }
        // double-check there are no emails that were flagged
        if (flagged.emails.includes(stagedData[key].email)) {
          removed.push({...stagedData[key], data_issue: "This record is duplicated. The email is associated with multiple customerId values.",});
          continue;
        }
        // create the final array of objects used to write the main CSV
        result.push(stagedData[key]);
      }

      // Based on 'action' parameter decide whether to write to a new csv or console log the status
      if (action === "duplicates") {
        const createdOrModified = folder === "raw" ? "Created" : "Modified";
        createCsvWriter
          .write(result, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/${fileName}`));
        createCsvWriter
          .write(removed, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/duplicates_${fileName}`));
        console.log(`\n${createdOrModified} file ${fileName}. It can be found at ./data/modified/${fileName}`)
        console.log(`\nCreated file duplicates_${fileName}. It can be found at ./data/modified/duplicates_${fileName}\n`)
      } else if (action === "test") {
        if (removed.length === 0) console.log("\nDuplicates Test: Passed\n");
        else {
          console.log("\nDuplicates Test: Failed");
          console.log(`Count of Duplicates: ${removed.length}\n`);
        }
      }
    });
}

export default {
  handleDuplicates,
};
