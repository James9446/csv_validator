# CSV Validator

**CSV Validator** is used to find and address data issues. It specifically handles negative numbers, missing data, and duplicate values. 

Some data issues are always handled the same way while others can be configured to handle the data issue according to configurable preferences. 

# Installation

You will need [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed on your local machine. 

To install the project follow these steps:

1. Clone or download this repo to your local machine using `https://github.com/James9446/csv_validator.git`.
2. Navigate to the project directory and install the dependencies using:

```bash
npm install
```

This will install the following dependencies:

1. "@inquirer/prompts"^3.0.4
2. "csv-parser"^3.0.0
3. "fast-csv"^4.3.6 

You can start the application using:

```bash
npm start
```

You can test the application using the provided dummy data CSV files located in the `raw` folder. To validate a new CSV add it to the `raw` folder, which is located in the `data` folder. 

## CSV File Requirements

CSV Validator expects and necessitates the presence of three specific columns in the provided CSV files:

- `email`
- `customerId`
- `points`

These three columns MUST be formatted exactly as displayed above. These columns are crucial for the CSV Valdiator to properly perform all its functions.

### Additional Columns

Your CSV file can contain additional columns. Any extra columns, beyond the aforementioned three, will be included in the newly generated CSV files during the data handling processes. Regardless of the actions selected (like handling missing data, duplicates, or negative numbers), any extra data not explicitly altered remains consistent in the new CSV files. 

# Actions

|      Action       |     If selected folder = `raw`     |     If selected folder = `modified`     |  Additional action  |
|:-----------------:|:-------------------------------:|:-----------------------------------:|:-------------------:|
|     Run Tests     |    No data modifications       |         No data modifications       |         None        |
| Handle Missing Data   | Creates a new modified CSV with the same file name and adds it to the `modified` folder | Modifies and replaces the selected file |         Creates an additional CSV with all of the rows that were removed due to missing data. It includes a column that describes what data was missing. The file name will be based on the selcted file (e.g. `missing_data_[selected file name].csv`). This file will be added to the `modified` folder. If a file with this exact same file name already exists in the modified folder then it will be replaced.       |
| Handle Duplicates | Creates a new modified CSV with the same file name and adds it to the `modified` folder | Modifies and replaces the selected file |         Creates an additional CSV with all of the rows that were removed due to duplicate data. It includes a column that describes what data was duplicated. The file name will be based on the selcted file `duplicates_[selected file name].csv`. If a file with this exact same file name already exists in the modified folder then it will be replaced.        |
| Handle Negatives  | Creates a new modified CSV with the same file name and adds it to the `modified` folder | Modifies and replaces the selected file |         None        |

## Run Tests
The `Run Tests` action will use all 3 of the other actions to run tests on the selected file. The results will be logged to the console. For each of these 3 tests it will specify whether the selected file passed or failed. If a test fails then the number of rows that have a data issue will also be logged to the console. 

## Handle Missing Data
When using the Handle Missing Data Action, you will select a configuration option. This option only comes into play if both the `customerId` and the `email` are not missing. 

#### Configuration Options: What should be done if a customer record is missing the points value?
- `Skip the customer record and capture the details`
- `Set the value to 0`

|      Data Issue     |   Configuration Option   |                    Result                            |
|:-------------------:|:------------------------:|:----------------------------------------------------:|
| Missing customerId  |       Either  configuration option selected      | The customer record is not included in the new CSV and is added to the Missing Data CSV                    |
| Missing email       |       Either configuration option selected      | The customer record is not included in the new CSV and is added to the Missing Data CSV                    |
| Missing points      |   Skip the customer record and capture the details   | The customer record is not included in the new CSV and is added to the Missing Data CSV                   |
| Missing points      |   Set the value to 0    | The customer record is included in the new CSV and the points value is set to 0. The customer record is NOT added to the Missing Data CSV  |

## Handle Duplicates 
When using the Handle Duplicates Action, you will select a configuration option. This option only comes into play if the duplicate customer record has the exact same `email` and `customerId` values but does not have the same `points` value.

#### Configuration Options: What should be done if a customer record is duplicated and has different point values?
- `Assign whichever point value is lower`
- `Assign whichever point value is higher`
- `Set the value to 0 and capture the details`

| Data Issue            |       Configuration Option        |       Result        |
|----------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Exact duplicate; the `email`, `customerId`, and `points` values are all the same          |       Any configuration option selected        |        The customer record is not included in the new CSV and is NOT added to the Duplicates CSV       |
| Duplicate `customerId`; the `customerId` is associated with more than one `email` |       Any configuration option selected       |       The customer record is not included in the new CSV and is added to the Duplicates CSV       |
| Duplicate `email`; the `email` is associated with more than one `customerId`      |       Any configuration option selected       |       The customer record is not included in the new CSV and is added to the Duplicates CSV       |
| Duplicate `points`; `email` and `customerId` values match but the `points` value does not |      Assign whichever point value is lower     |     The customer record is included in the new CSV with the highest point value found. The customer record is NOT added to the Duplicates CSV     |
| Duplicate `points`; `email` and `customerId` values match but the `points` value does not |      Assign whichever point value is higher      |     The customer record is included in the new CSV with the highest point value found. The customer record is NOT added to the Duplicates CSV     |
| Duplicate `points`; `email` and `customerId` values match but the `points` value does not |      Set the value to 0 and capture the details      |     The customer record is included in the new CSV with the point value set to 0. The duplacate customer records are added to the Duplicates CSV     |

## Handle Negative Numbers
All customer records with negative `points` values are set to 0 and added to the new CSV. There is no additional CSV for capturing customer records that had a negative value.  

# Usage

#### General Usage
2. Run the application using `npm start`.
3. Pick an action you’d like to execute:
   - `Run Tests`
   - `Handle Missing Data`
   - `Handle Duplicates`
   - `Handle Negatives`
4. Select the folder containing the file you wish to take an action on.
5. Select a CSV file from the chosen folder.
6. Based on the action chosen, you may need to follow the prompts to configure your action.

_Note: It is generaly best to run actions in the order they are listed in the prompt. It is best to handle missing data before handling duplicate data or handling negatives. It is best to handle duplicates before handling negatives. `Run Tests` >>> `Handle Missing Data` >>> `Handle Duplicates` >>> `Handle Negatives` >>> `Run Tests`_ 

#### Usage Overview
1. Add a CSV file to the `raw` folder (or try using one of the test CSV files provided).
2. Run the application using `npm start`.
3. Select the `Run Tests` action.
4. Select the `raw` folder.
5. Select a CSV file.
6. See which tests fail and handle the data issues accordingly. (Let's imagine all test's fail)
7. Run the application again using `npm start`.
8. Select the `Handle Missing Data` action.
9. Select the `raw` folder.
10. Select the same CSV file from step 5. 
11. Select a Configuration Option (e.g. `Skip the customer record and capture the details`) 
12. A new CSV (with the same file name) will be added to the `modified` folder. 
13. ALL ADDITIONAL ACTIONS should be run on the new file located in the `modified` folder.
14. If you perform the `Run Tests` action on the new file in the `modified` folder it should now pass the Missing Data Test. 
15. The `Handle Duplicates` and the `Handle Negatives` should now be run on the new CSV in the `modified` folder. Doing so will update this CSV. If you run these actions on the original CSV located in the `raw` folder then the CSV in the `modified` folder will be replaced instead of updated and the modifications from the the `Handle Missing Data` action will be lost. 
16. Complete all actions until all tests pass!


## Full Example 
 
### Run Tests:
```bash
npm start

What action would you like to take? (Use arrow keys)
❯ Run Tests
  Handle Missing Data
  Handle Duplicates
  Handle Negatives

Select a Folder
  modified
❯ raw

Select a File (Use arrow keys)
❯ dummy_data_0.csv
  dummy_data_1.csv
  dummy_data_2.csv
  dummy_data_3.csv
  dummy_data_million_records.csv
  test_bad_headers.csv
```

#### Console:
```
Missing Data Test: FAILED
 • Count of Missing: 7


Duplicates Test: FAILED
 • Count of Duplicates: 6
 • Count of Exact Duplicates: 1 (Note: Exact Duplicates will not be added to duplicates_dummy_data_0.csv)


Negatives Test: FAILED
 • Negatives total: 2
```


## Handle Missing Data:
```bash
npm start

What action would you like to take?
  Run Tests
❯ Handle Missing Data
  Handle Duplicates
  Handle Negatives

Select a Folder
  modified
❯ raw

Select a File (Use arrow keys)
❯ dummy_data_0.csv
  dummy_data_1.csv
  dummy_data_2.csv
  dummy_data_3.csv
  dummy_data_million_records.csv
  test_bad_headers.csv

What should be done if a customer record is missing the points value? (Use arrow keys)
❯ Skip the customer record and capture the details
  Set the value to 0
```

#### Console:   
```
Created file: dummy_data_0.csv. It can be found at ./data/modified/

Created file: missing_data_dummy_data_0.csv. It can be found at ./data/modified/
```

## Handle Duplicates:
```bash
npm start

What action would you like to take?
  Run Tests
  Handle Missing Data
❯ Handle Duplicates
  Handle Negatives

Select a Folder (Use arrow keys)
❯ modified
  raw

Select a File (Use arrow keys)
❯ dummy_data_0.csv
  missing_data_dummy_data_0.csv

What should be done if a customer record is duplicated and has different point values? (Use arrow keys)
❯ Assign whichever point value is lower
  Assign whichever point value is higher
  Set the value to 0 and capture the details
```

#### Console: 
```
Modified file dummy_data_0.csv. It can be found at ./data/modified/

Created file duplicates_dummy_data_0.csv. It can be found at ./data/modified/
```

## Handle Negatives:
```bash
npm start

What action would you like to take?
  Run Tests
  Handle Missing Data
  Handle Duplicates
❯ Handle Negatives

Select a Folder (Use arrow keys)
❯ modified
  raw

Select a File (Use arrow keys)
❯ dummy_data_0.csv
  duplicates_dummy_data_0.csv
  missing_data_dummy_data_0.csv
```

#### Console: 
```
Modified file dummy_data_0.csv. It can be found at ./data/modified/
```

## Run Tests:
```bash
npm start

What action would you like to take? (Use arrow keys)
❯ Run Tests
  Handle Missing Data
  Handle Duplicates
  Handle Negatives

Select a Folder (Use arrow keys)
❯ modified
  raw

Select a File (Use arrow keys)
❯ dummy_data_0.csv
  duplicates_dummy_data_0.csv
  missing_data_dummy_data_0.csv
```

#### Console:
```
Missing Data Test: PASSED


Duplicates Test: PASSED


Negatives Test: PASSED
```
## License

This package is licensed under the ISC license.

## Authors and acknowledgment

This project was developed by James Reynolds.
