import fs from "fs";
import csv from "csv-parser";
import createCsvWriter from "fast-csv";

export async function handleNegatives(action = "test", folder, fileName) {
  let path = `./data/${folder}/${fileName}`
  let data = [];
  let totalNegative = 0;
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
      if (Number(row.points) < 0) {
        totalNegative += 1;
        switch (action) {
          case "list":
            data.push(row);
            break;
          case "negatives":
            row.points = 0;
            data.push(row);
            break;
        }
      } else {
        if (action === "negatives") data.push(row); // push unchanged row if action is process
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
          case "negatives":
            path = `./data/modified/${fileName}`
            
            // this creates a new csv file with modified data
            const csvWriter = createCsvWriter.writeToPath(
              path,
              data,
              { headers: true }
            ); 
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
  handleNegatives,
};
