/**
 * scripts/gen-characters.js
 *
 * Reads src/assets/characters/manifest.json and creates folders (if not exists)
 * Writes a character.json for each entry using template.character.json
 *
 * Usage:
 *  node scripts/gen-characters.js
 *
 * (Run from project root)
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'src', 'assets', 'characters', 'manifest.json');
const templatePath = path.join(__dirname, '..', 'src', 'assets', 'characters', 'template.character.json');
const baseDir = path.join(__dirname, '..', 'src', 'assets', 'characters');

if (!fs.existsSync(manifestPath)) {
  console.error('manifest.json not found at', manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

manifest.characters.forEach(c => {
  const folder = path.join(baseDir, c.folder);
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
  const charFile = path.join(folder, 'character.json');

  const charData = Object.assign({}, template, {
    id: c.id,
    en_name: c.en,
    tr_name: c.tr,
    profileImage: c.profileImage
  });

  fs.writeFileSync(charFile, JSON.stringify(charData, null, 2), 'utf8');

  // create placeholder profile image filename (empty file) if not exists
  const imgPath = path.join(folder, c.profileImage);
  if (!fs.existsSync(imgPath)) fs.writeFileSync(imgPath, '', 'utf8');
  console.log('Created', charFile);
});

console.log('Done. Created', manifest.characters.length, 'character folders.');