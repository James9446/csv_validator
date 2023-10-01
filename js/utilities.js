'use strict'
// const fs = require('fs');
// import * as fs from 'node:fs/promises';
import * as fs from 'node:fs';


export function listFolderFiles(type='select', path='./data/uploaded') {
  try {
    return fs.readdirSync(path).map(file => {
      // console.log(file);
      if (type === 'select') {
        let choice = {
          name: file,
          value: file
        };
        return choice
      }
      if (type === 'list') {
        return file
      }
    })
  } catch (err) {
    console.error('Error: ', err);
  }
};

export function setConfig(key, value) {
  let config = fetchFile();
  config[key] = value;
  saveFile(config);
};

export function fetchFile(path='./', fileName='config.json', type='json') {
  try {
    if (type === 'json') {
      return JSON.parse(fs.readFileSync(`${path}${fileName}`));
    };
  } catch (err) {
    console.error('Error: ', err);
    return;
  }
};

export function saveFile (data, path='./', fileName='config.json', type='json') {
  try {
    if (type === 'json') {
      fs.writeFileSync(`${path}${fileName}`, JSON.stringify(data));
    };
  } catch (err) {
    console.error('Error: ', err);
  }
};

export default {
  listFolderFiles,
  setConfig
}