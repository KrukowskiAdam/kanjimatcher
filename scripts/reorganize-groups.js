import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../static/joyo_kanji_en_custom.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Original group sizes:');
data.groups.forEach((group, idx) => {
  const count = group.items.length;
  const remainder = count % 9;
  console.log(`Group ${idx + 1}: ${group.label} - ${count} items (remainder: ${remainder})`);
});

// Redistribute items so each group is divisible by 9
const newGroups = [];
let carryOver = [];

data.groups.forEach((group, idx) => {
  // Combine carry-over with current group items
  const allItems = [...carryOver, ...group.items];
  
  const isLastGroup = idx === data.groups.length - 1;
  
  if (isLastGroup) {
    // For the last group, round down to nearest multiple of 9
    const remainder = allItems.length % 9;
    const keepCount = allItems.length - remainder;
    
    if (keepCount > 0) {
      newGroups.push({
        label: group.label,
        items: allItems.slice(0, keepCount)
      });
    }
    
    // Discard remaining items that don't fit
    const leftover = allItems.slice(keepCount);
    if (leftover.length > 0) {
      console.log(`\n⚠️  Discarding ${leftover.length} kanji from the end (not divisible by 9):`);
      leftover.forEach(item => console.log(`   - ${item.kanji} (${item.hiragana}) - ${item.meaning}`));
    }
    
    carryOver = [];
  } else {
    // Calculate how many complete sets of 9 we can make
    const remainder = allItems.length % 9;
    const keepCount = allItems.length - remainder;
    
    // Items to keep in this group (divisible by 9)
    const itemsToKeep = allItems.slice(0, keepCount);
    
    // Items to carry over to next group
    carryOver = allItems.slice(keepCount);
    
    // Only add group if it has items
    if (itemsToKeep.length > 0) {
      newGroups.push({
        label: group.label,
        items: itemsToKeep
      });
    }
  }
});

// Save the new structure
data.groups = newGroups;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

console.log('\n✓ File reorganized successfully!');
console.log('\nNew group sizes:');
newGroups.forEach((group, idx) => {
  const count = group.items.length;
  const remainder = count % 9;
  console.log(`Group ${idx + 1}: ${group.label} - ${count} items (remainder: ${remainder})`);
});
console.log('\nTotal items:', newGroups.reduce((sum, g) => sum + g.items.length, 0));
