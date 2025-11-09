const fs = require('fs');
const path = require('path');

// Read characters list
const charactersListPath = path.join(__dirname, '../data/characters-list.json');
const charactersList = JSON.parse(fs.readFileSync(charactersListPath, 'utf8'));

// Base directories
const charactersDir = path.join(__dirname, '../data/characters');

// Ensure characters directory exists
if (!fs.existsSync(charactersDir)) {
  fs.mkdirSync(charactersDir, { recursive: true });
}

// Template for profile.json
const createProfileTemplate = (character) => {
  return JSON.stringify({
    id: character.id,
    name: {
      en: character.en,
      tr: character.tr
    },
    physical: {
      hairColor: "",
      eyeColor: "",
      height: "",
      bodyType: "",
      skinTone: "",
      age: "",
      notes: "Add physical features based on photo"
    },
    personality: {
      traits: [],
      bio: "",
      interests: []
    },
    progress: {
      discovered: [],
      percentage: 0
    },
    conversationStyle: {
      tone: "",
      vocabulary: "",
      examplePhrases: []
    }
  }, null, 2);
};

// Template for conversation-style.txt
const createConversationTemplate = (characterName) => {
  return `# ${characterName}'s Conversation Style

## Tone & Personality
[Describe her overall tone - friendly, playful, serious, shy, etc.]

## Speaking Style
- [How does she speak? Short sentences? Long explanations?]
- [Does she use emojis?]
- [Formal or casual?]
- [Any unique speech patterns?]

## Topics She Loves
- 
- 
- 

## Topics She Avoids
- 
- 
- 

## Example Conversations

### First Message
${characterName}: [Write example opening message]

### When Happy
${characterName}: [Example happy response]

### When Asked About Hobbies
${characterName}: [Example hobby discussion]

### When Flirted With
${characterName}: [Example flirty response]

### When Asked Personal Questions
${characterName}: [Example personal response]

## Character Notes for AI
[Any additional notes about how AI should behave as ${characterName}]
`; 
};

// Template for README.md
const createReadmeTemplate = (characterName) => {
  return `# ${characterName}

## Files in this folder:

### 1. profile.json
Character profile with physical and personality traits.

**How to fill:**
- Add a photo named \`photo.jpg\` to this folder
- Fill in physical characteristics based on the photo
- Add personality traits (will be randomly assigned during gameplay)
- Write a short bio
- List interests

### 2. conversation-style.txt
AI training file for conversation behavior.

**How to fill:**
- Describe how ${characterName} talks
- Provide 5-7 example conversations
- Specify topics she likes/avoids
- Add notes for AI behavior

### 3. photo.jpg
Add character photo here (you need to add this manually)

## Progress
- [ ] Add photo.jpg
- [ ] Fill profile.json physical features
- [ ] Fill profile.json personality
- [ ] Write conversation-style.txt
`; 
};

// Create templates for all characters
let created = 0;
let skipped = 0;

charactersList.forEach(character => {
  const characterDir = path.join(charactersDir, character.en);
  
  // Skip if character folder already exists
  if (fs.existsSync(characterDir)) {
    console.log(`⏭️  Skipping ${character.en} (already exists)`);
    skipped++;
    return;
  }
  
  // Create character directory
  fs.mkdirSync(characterDir, { recursive: true });
  
  // Create profile.json
  const profilePath = path.join(characterDir, 'profile.json');
  fs.writeFileSync(profilePath, createProfileTemplate(character));
  
  // Create conversation-style.txt
  const conversationPath = path.join(characterDir, 'conversation-style.txt');
  fs.writeFileSync(conversationPath, createConversationTemplate(character.en));
  
  // Create README.md
  const readmePath = path.join(characterDir, 'README.md');
  fs.writeFileSync(readmePath, createReadmeTemplate(character.en));
  
  console.log(`✅ Created templates for ${character.en} (${character.tr})`);
  created++;
});

console.log(`\n🎉 Done!`);
console.log(`✅ Created: ${created} characters`);
console.log(`⏭️  Skipped: ${skipped} characters (already exist)`);
console.log(`\n📁 All character templates are in: data/characters/`);