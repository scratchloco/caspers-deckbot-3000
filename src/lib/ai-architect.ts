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

const TRIBAL_THEMES = [ 'angel', 'demon', 'dragon', 'elf', 'goblin', 'merfolk', 'sliver', 'soldier', 'spirit', 'vampire', 'wizard', 'zombie'];
const MECHANICAL_THEME_KEYWORDS: Record<string, string[]> = { 'tokens': ['create', 'token'], 'lifegain': ['gain life'], 'graveyard': ['graveyard'], 'mill': ['mill', 'put the top'], 'burn': ['deal damage'], 'counters (+1/+1)': ['+1/+1 counter'], 'enchantments': ['enchantment'], 'artifacts': ['artifact'], 'ramp': ['add', 'mana pool'],};

export async function buildDeck(collection: ScryfallCard[], recipe: Recipe): Promise<Deck> {
  let cardPool: ScryfallCard[] = [];
  let deckContext = '';

  if (recipe.type === 'colors') {
    const selectedColors = recipe.value as string[];
    deckContext = `A casual, 60-card, ${selectedColors.join('/')} deck.`;
    cardPool = collection.filter(card => {
      if (card.type_line.includes('Land') || !card.color_identity || card.color_identity.length === 0) return false;
      return card.color_identity.every(c => selectedColors.includes(c));
    });
  } else if (recipe.type === 'theme') {
    const theme = (recipe.value as string).toLowerCase();
    deckContext = `A casual, 60-card, "${theme}" themed deck.`;
    if (TRIBAL_THEMES.includes(theme)) {
      cardPool = collection.filter(card => {
        const name = (card.name || '').toLowerCase();
        const typeLine = (card.type_line || '').toLowerCase();
        const oracleText = (card.oracle_text || '').toLowerCase();
        return name.includes(theme) || typeLine.includes(theme) || oracleText.includes(theme);
      });
    } else if (MECHANICAL_THEME_KEYWORDS[theme]) {
      const keywords = MECHANICAL_THEME_KEYWORDS[theme];
      cardPool = collection.filter(card => {
        const text = (card.oracle_text || '').toLowerCase();
        return keywords.every(keyword => text.includes(keyword));
      });
    }
  }
  
  const MINIMUM_POOL_SIZE = 15;
  let analysisPool = cardPool;

  if (cardPool.length < MINIMUM_POOL_SIZE) {
    alert(`Could not find enough cards for "${recipe.value}" in your collection. Found only ${cardPool.length} cards.`);
    return { creatures: [], spells: [], lands: [] };
  }
  
  if (cardPool.length < 40) {
    const coreCardNames = cardPool.map(card => card.name);
    deckContext = `I am building a "${recipe.value}" themed deck. The core cards are: ${JSON.stringify(coreCardNames)}. Please find other cards from my entire collection with good synergy.`;
    analysisPool = collection.filter(card => !card.type_line.includes('Land'));
  }

  let allCardScores: { name: string; score: number }[] = [];
  const CHUNK_SIZE = 200;

  for (let i = 0; i < analysisPool.length; i += CHUNK_SIZE) {
    const chunk = analysisPool.slice(i, i + CHUNK_SIZE);
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
    allCardScores.map((item) => {
      const score = parseInt(String(item.score), 10);
      return [item.name, isNaN(score) ? 0 : score];
    })
  );
  
  const creatures = analysisPool.filter(c => c.type_line?.includes('Creature')).sort((a, b) => (scoreMap.get(b.name) || 0) - (scoreMap.get(a.name) || 0));
  const spells = analysisPool.filter(c => !c.type_line?.includes('Creature') && !c.type_line?.includes('Land')).sort((a, b) => (scoreMap.get(b.name) || 0) - (scoreMap.get(a.name) || 0));

  const blueprint = { creatures: 22, spells: 14, lands: 24 };
  const finalDeck: Deck = { creatures: [], spells: [], lands: [] };
  finalDeck.creatures = creatures.slice(0, blueprint.creatures);
  finalDeck.spells = spells.slice(0, blueprint.spells);
  
  const totalSpells = finalDeck.creatures.length + finalDeck.spells.length;
  if (totalSpells < 15) {
      alert(`Could not build a reasonable deck for "${recipe.value}". Only found ${totalSpells} fitting cards.`);
      return { creatures: [], spells: [], lands: [] };
  }

  const landCount = 60 - totalSpells;
  for (let i = 0; i < landCount; i++) {
    finalDeck.lands.push({ id: `basic-land-${i}`, name: 'Basic Land (Placeholder)', color_identity: [], type_line: 'Land' });
  }

  return finalDeck;
}