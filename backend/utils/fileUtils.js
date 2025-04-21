import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const dataFilePath = path.join(__dirname, "data", 'socketData.json');

export const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  } catch (err) {
    console.error('Error reading data file:', err);
    return {};
  }
};

export const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log('Data updated and saved:', data);
  } catch (err) {
    console.error('Error writing data file:', err);
  }
};
