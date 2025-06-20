// /src/lib/ai-architect.ts

import { ScryfallCard } from './scryfall';

export type Deck = {
  creatures: ScryfallCard[];
  spells: ScryfallCard[];
  lands: ScryfallCard[];
};

type Recipe = {
  type: 'colors' | 'theme';
  value: string[] | string;
};

// --- A SMARTER AI: We now distinguish between theme types ---
const TRIBAL_THEMES = [
  'angels', 'demons', 'dragons', 'elves', 'goblins', 'merfolk', 'slivers', 
  'soldiers', 'spirits', 'vampires', 'wizards', 'zombies'
];
// We will add more keywords to these as we test more themes
const MECHANICAL_THEME_KEYWORDS: Record<string, string[]> = {
  'tokens': ['create', 'token'],
  'lifegain': ['gain life'],
  'graveyard': ['graveyard'],
  'mill': ['mill', 'put the top'],
  'burn': ['deal damage'],
  'counters (+1/+1)': ['+1/+1 counter'],
  'enchantments': ['enchantment'],
  'artifacts': ['artifact'],
  'ramp': ['add', 'mana pool'],
};


// --- Helper Functions ---
const isRemoval = (card: ScryfallCard): boolean => {
  const text = card.oracle_text || '';
  return text.includes('destroy target') || text.includes('exile target');
};
const isCardDraw = (card: ScryfallCard): boolean => {
  const text = card.oracle_text || '';
  return text.includes('draw a card') || text.includes('draw two cards') || text.includes('draw cards');
};


// --- The Main AI Function ---
export function buildDeck(collection: ScryfallCard[], recipe: Recipe): Deck {
  console.log('AI Architect V2: Starting deck construction...');

  let cardPool = collection;

  // == STEP 1: A SMARTER Filter based on the recipe ==
  if (recipe.type === 'colors') {
    const colors = recipe.value as string[];
    cardPool = collection.filter(card => 
      !card.type_line.includes('Land') && card.colors && card.colors.length > 0 && card.colors.every((c: string) => colors.includes(c))
    );
  } else if (recipe.type === 'theme') {
    const theme = (recipe.value as string).toLowerCase();
    
    // NEW LOGIC: Check if it's a tribal or mechanical theme
    if (TRIBAL_THEMES.includes(theme)) {
      // For tribes, we check the type line
      console.log(`AI: Filtering for a TRIBAL theme: ${theme}`);
      cardPool = collection.filter(card => 
        card.type_line?.toLowerCase().includes(theme)
      );
    } else if (MECHANICAL_THEME_KEYWORDS[theme]) {
      // For mechanics, we check the oracle text for ALL keywords
      console.log(`AI: Filtering for a MECHANICAL theme: ${theme}`);
      const keywords = MECHANICAL_THEME_KEYWORDS[theme];
      cardPool = collection.filter(card => {
        const text = (card.oracle_text || '').toLowerCase();
        return keywords.every(keyword => text.includes(keyword));
      });
    } else {
      // Fallback for themes not in our lists (like 'Angels' or user-defined)
      console.log(`AI: Filtering for a GENERAL theme: ${theme}`);
      cardPool = collection.filter(card =>
        card.type_line?.toLowerCase().includes(theme) || 
        card.name?.toLowerCase().includes(theme) ||
        (card.oracle_text || '').toLowerCase().includes(theme)
      );
    }
  }
  console.log(`AI Architect: Filtered to a pool of ${cardPool.length} cards.`);

  // == STEP 2: Categorize the filtered card pool ==
  const categorizedCards = {
    creatures: cardPool.filter(c => c.type_line?.includes('Creature')),
    removal: cardPool.filter(isRemoval),
    cardDraw: cardPool.filter(isCardDraw),
    spells: cardPool.filter(c => !c.type_line?.includes('Creature') && !c.type_line?.includes('Land')),
  };

  // == STEP 3: Define the Deck Blueprint ==
  const blueprint = {
    creatures: 22,
    spells: 14,
    lands: 24,
  };

  const finalDeck: Deck = { creatures: [], spells: [], lands: [] };

  // == STEP 4: Fill the Deck Slots ==
  finalDeck.creatures = categorizedCards.creatures.slice(0, blueprint.creatures);
  const otherSpells = categorizedCards.spells.filter(c => !isRemoval(c) && !isCardDraw(c));
  finalDeck.spells = [ ...categorizedCards.removal, ...categorizedCards.cardDraw, ...otherSpells ].slice(0, blueprint.spells);
  
  // == STEP 5: Add Lands ==
  const totalSpells = finalDeck.creatures.length + finalDeck.spells.length;
  const landCount = 60 - totalSpells;
  for (let i = 0; i < landCount; i++) {
    finalDeck.lands.push({ id: `basic-land-${i}`, name: 'Basic Land (Placeholder)', type_line: 'Land' });
  }

  console.log('AI Architect: Deck construction complete!');
  return finalDeck;
}