#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '..', 'word_list.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV (skip header line)
const lines = csvContent.trim().split('\n').slice(1);
const words = lines.map(line => {
  // Parse CSV line - handle potential commas in meanings
  const parts = line.split(',');
  const index = parts[0];
  const hanzi = parts[1];
  const pinyin = parts[2];
  // Join remaining parts in case meaning contains commas
  const meaning = parts.slice(3).join(',');
  
  return {
    hanzi: hanzi,
    pinyin: pinyin,
    meaning: meaning,
  };
});

// Generate the import data with proper structure for Word entities
const importData = words.map((word, index) => ({
  id: `word-${index + 1}-${Date.now()}`,
  hanzi: word.hanzi,
  pinyin: word.pinyin,
  meaning: word.meaning,
  // Initial SRS parameters
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  due: Date.now(),
  status: "new",
  // Learning queue fields
  learningStep: 0,  // Default to 0 (not in learning)
  learningDue: undefined,  // Optional field
  createdAt: Date.now(),
  updatedAt: undefined,  // Optional field
}));

// Write to JSON file
const outputPath = path.join(__dirname, '..', 'src', 'data', 'words_import.json');

// Ensure the data directory exists
const dataDir = path.dirname(outputPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2));

console.log(`Successfully converted ${words.length} words from CSV to JSON`);
console.log(`Output saved to: ${outputPath}`);
console.log('You can now run the import in your app.'); 