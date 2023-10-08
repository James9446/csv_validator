import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";

export async function handleDuplicates(
  action = "test",
  folder,
  fileName,
  option = "lower"
) {
  let path = `./data/${folder}/${fileName}`;
  let data = [];
  let IDandEmailDupObj = {};
  let customerIdReference = {};
  let emailReference = {};
  let flagged = {
    emails: [],
    customerIds: []
  }
  let removed = [];
  let result = [];
  // let seen = new Set(); // To keep track of seen rows

  // parse the csv
  fs.createReadStream(path)
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", async () => {
      // Checking for duplicates and processing
      for (let i = 0; i < data.length; i++) {
        let key = data[i].customerId + data[i].email;

        if (IDandEmailDupObj[key] && IDandEmailDupObj[key].points === data[i].points) {
          // record is an exact match and doesn't need to be logged; it should just be skipped
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

        // if (flagged[key]) {
        //   removed.push({...data[i], data_issue: flagged[key].message,});
        //   continue;
        // }

        // let rowStr = JSON.stringify(data[i]);
        // if (seen.has(rowStr)) {
        //   removed.push({
        //     ...data[i],
        //     data_issue: "This is an exact duplicate row.",
        //   });
        //   continue;
        // }
        // seen.add(rowStr);

        // Check if one customerId is associated with multiple email values
        if (customerIdReference[data[i].customerId] && customerIdReference[data[i].customerId] !== data[i].email) {
          const message = "This record is duplicated. The customerId is associated with multiple email values."
          removed.push({...data[i], data_issue: message,});
          for (let key in IDandEmailDupObj) {
            if (IDandEmailDupObj[key].customerId === data[i].customerId) {
              // flagged[key] = IDandEmailDupObj[key];
              // flagged[key].message = message;
              flagged.customerIds.push(data[i].customerId);
              flagged.emails.push(data[i].email);
              removed.push({...IDandEmailDupObj[key], data_issue: message,});
              delete IDandEmailDupObj[key];
            }
          }
          continue;
        }
        customerIdReference[data[i].customerId] = data[i].email;

        // Check if one email is associated with multiple customerId values
        if (emailReference[data[i].email] && emailReference[data[i].email] !== data[i].customerId) {
          const message = "This record is duplicated. The email is associated with multiple customerId values.";
          removed.push({...data[i], data_issue: message,});
          for (let key in IDandEmailDupObj) {
            if (IDandEmailDupObj[key].email === data[i].email) {
              // flagged[key] = IDandEmailDupObj[key];
              // flagged[key].message = message;
              flagged.customerIds.push(data[i].customerId);
              flagged.emails.push(data[i].email);
              removed.push({...IDandEmailDupObj[key], data_issue: message,});
              delete IDandEmailDupObj[key];
            }
          }
          continue;
        }
        emailReference[data[i].email] = data[i].customerId;

        // Continue with existing procedure for duplicates with same customerId & email
        // key defined at top of for loop
        if (IDandEmailDupObj[key]) {
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
              if (data[i].points < IDandEmailDupObj[key].points) {
                // removed.push({...IDandEmailDupObj[key], data_issue: "A points discrepancy was found. The points value was set to the lower amount",});
                // removed.push({...data[i], data_issue: "A points discrepancy was found. The points value was set to the lower amount",});
                IDandEmailDupObj[key] = data[i];
              }
              break;
            case "higher":
              if (data[i].points > IDandEmailDupObj[key].points) {
                // removed.push({...IDandEmailDupObj[key], data_issue: "A points discrepancy was found. The points value was set to the higher amount",});
                // removed.push({...data[key], data_issue: "A points discrepancy was found. The points value was set to the higher amount",});
                IDandEmailDupObj[key] = data[i];
              }
              break;
            case "setToZero":
              IDandEmailDupObj[key].points = 0;
              // removed.push({...data[i], data_issue: "A points discrepancy was found. The customer's points value was set to 0",});
              break;
            default:
              break;
          }
        } else IDandEmailDupObj[key] = data[i];
      }

      for (let key in IDandEmailDupObj) {

        if (flagged.customerIds.includes(IDandEmailDupObj[key].customerId)) {
          removed.push({...IDandEmailDupObj[key], data_issue: "This record is duplicated. The customerId is associated with multiple email values.",});
          continue;
        }

        if (flagged.emails.includes(IDandEmailDupObj[key].email)) {
          removed.push({...IDandEmailDupObj[key], data_issue: "This record is duplicated. The email is associated with multiple customerId values.",});
          continue;
        }

        result.push(IDandEmailDupObj[key]);
      }

      // Based on 'action' parameter decide whether to write to a new csv or console log the status
      if (action === "duplicates") {
        createCsvWriter
          .write(result, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/${fileName}`));
        createCsvWriter
          .write(removed, { headers: true })
          .pipe(fs.createWriteStream(`./data/modified/duplicates_${fileName}.csv`));
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
