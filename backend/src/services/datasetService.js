import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_PATH = path.resolve(__dirname, '../../Dataset/puneSafty.csv');

class DatasetService {
  constructor() {
    this.data = [];
    this.isLoaded = false;
  }

  loadData() {
    if (this.isLoaded) return;
    try {
      const csvData = fs.readFileSync(DATASET_PATH, 'utf-8');
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      this.data = lines.slice(1).map(line => {
        // Handle quotes in CSV
        const row = [];
        let inQuotes = false;
        let currentValue = "";
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') {
            inQuotes = !inQuotes;
          } else if (line[i] === ',' && !inQuotes) {
            row.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += line[i];
          }
        }
        row.push(currentValue.trim());

        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
      this.isLoaded = true;
      console.log(`[DatasetService] Loaded ${this.data.length} records from Pune Safety Dataset.`);
    } catch (err) {
      console.error("[DatasetService] Failed to load dataset:", err);
    }
  }

  getRawData() {
    this.loadData();
    return this.data;
  }

  getWards() {
    this.loadData();
    const wards = new Set();
    this.data.forEach(row => {
      if (row['Location/Area']) wards.add(row['Location/Area']);
    });
    return Array.from(wards);
  }
}

export default new DatasetService();
