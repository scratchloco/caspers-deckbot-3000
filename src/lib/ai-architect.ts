// /src/lib/ai-architect.ts

import { ScryfallCard } from './scryfall';

export type Deck = {
  creatures: ScryfallCard[];
  spells: ScryfallCard[];
  lands: ScryfallCard[];
};

// Simplified the Recipe type. It's always the same shape now.
export type Recipe = {
  type: 'theme_and_colors';
  value: { theme: string, colors: string[] };
};

const TRIBAL_THEMES = [ 'angel', 'demon', 'dragon', 'elf', 'goblin', 'merfolk', 'sliver', 'soldier', 'spirit', 'vampire', 'wizard', 'zombie'];

export async function buildDeck(collection: ScryfallCard[], recipe: Recipe): Promise<Deck> {
  let cardPool = collection.filter(card => !card.type_line.includes('Land')); // Start with all non-land cards
  let deckContext = '';
  
  const { theme, colors } = recipe.value;
  const lowerCaseTheme = theme.trim().toLowerCase();

  // --- NEW UNIFIED FILTERING LOGIC ---

  // 1. Filter by theme IF a theme is provided
  if (lowerCaseTheme) {
    deckContext = `A casual, 60-card, "${theme}" themed deck`;
    if (TRIBAL_THEMES.includes(lowerCaseTheme)) {
        cardPool = cardPool.filter(card => {
        const name = (card.name || '').toLowerCase();
        const typeLine = (card.type_line || '').toLowerCase();
        const oracleText = (card.oracle_text || '').toLowerCase();
        return name.includes(lowerCaseTheme) || typeLine.includes(lowerCaseTheme) || oracleText.includes(lowerCaseTheme);
      });
    } else { // Handle mechanical themes or custom user themes
        cardPool = cardPool.filter(card => {
        const text = (card.oracle_text || '').toLowerCase();
        return text.includes(lowerCaseTheme);
      });
    }
  }

  // 2. Filter by colors IF colors are provided
  if (colors.length > 0) {
    if (deckContext) {
      deckContext += ` within the colors ${colors.join('/')}.`;
    } else {
      deckContext = `A casual, 60-card, ${colors.join('/')} deck.`;
    }
    
    cardPool = cardPool.filter(card => {
      if (!card.color_identity || card.color_identity.length === 0) return false;
      return card.color_identity.every(c => colors.includes(c));
    });
  }
  
  // The rest of the function remains the same...
  const MINIMUM_POOL_SIZE = 22;
  if (cardPool.length < MINIMUM_POOL_SIZE) {
    alert(`Could not find enough cards for your recipe. Found only ${cardPool.length} cards. Please try a different combination.`);
    return { creatures: [], spells: [], lands: [] };
  }

  let allCardScores: { name: string; score: number }[] = [];
  const CHUNK_SIZE = 200;
  for (let i = 0; i < cardPool.length; i += CHUNK_SIZE) {
    const chunk = cardPool.slice(i, i + CHUNK_SIZE);
    try {
      const response = await fetch('/api/score-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNames: chunk.map(card => card.name), deckContext: deckContext }),
      });
      const scoredData = await response.json();
      if (!response.ok) throw new Error(scoredData.error + ' Details: ' + (scoredData.details || 'No details provided.'));
      if (!scoredData.card_scores) throw new Error("AI response missing 'card_scores' array.");
      allCardScores.push(...scoredData.card_scores);
    } catch (error) {
      console.error("CRITICAL ERROR PROCESSING AI RESPONSE:", error);
      alert("A critical error occurred while talking to the AI. Check console (F12) for details.");
      return { creatures: [], spells: [], lands: [] };
    }
  }
  
  const scoreMap = new Map(
    allCardScores.map((item: { name: string; score: number }) => {
      const score = parseInt(String(item.score), 10);
      return [item.name, isNaN(score) ? 0 : score];
    })
  );
  
  const creatures = cardPool.filter(c => c.type_line?.includes('Creature')).sort((a, b) => (scoreMap.get(b.name) || 0) - (scoreMap.get(a.name) || 0));
  const spells = cardPool.filter(c => !c.type_line?.includes('Creature') && !c.type_line?.includes('Land')).sort((a, b) => (scoreMap.get(b.name) || 0) - (scoreMap.get(a.name) || 0));

  const blueprint = { creatures: 22, spells: 14, lands: 24 };
  const finalDeck: Deck = { creatures: [], spells: [], lands: [] };
  finalDeck.creatures = creatures.slice(0, blueprint.creatures);
  finalDeck.spells = spells.slice(0, blueprint.spells);
  
  const totalSpells = finalDeck.creatures.length + finalDeck.spells.length;
  if (totalSpells < 15) {
      alert(`Could not build a reasonable deck for your recipe. Only found ${totalSpells} fitting cards.`);
      return { creatures: [], spells: [], lands: [] };
  }

  const landCount = 60 - totalSpells;
  for (let i = 0; i < landCount; i++) {
    finalDeck.lands.push({ id: `basic-land-${i}`, name: 'Basic Land (Placeholder)', color_identity: [], type_line: 'Land' });
  }

  return finalDeck;
}