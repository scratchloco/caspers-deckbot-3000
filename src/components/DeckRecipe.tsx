// /src/components/DeckRecipe.tsx
"use client";

import { useState } from 'react';
import { buildDeck, Deck } from '../lib/ai-architect';
import { ScryfallCard } from '../lib/scryfall'; // <-- Add this new line and remove ScryfallCard from the line above

// Update props to include the new onDeckBuild function
type RecipeProps = {
  collection: ScryfallCard[];
  onDeckBuild: (deck: Deck) => void; 
};

// ... (keep the THEMES constant the same)
const THEMES = [
  'Angels', 'Demons', 'Dragons', 'Elves', 'Goblins', 'Merfolk', 'Slivers', 
  'Soldiers', 'Spirits', 'Vampires', 'Wizards', 'Zombies', 'Artifacts', 'Burn', 
  'Counters (+1/+1)', 'Enchantments', 'Graveyard', 'Lifegain', 'Mill', 'Ramp', 'Tokens'
];


export function DeckRecipe({ collection, onDeckBuild }: RecipeProps) {
  const [recipeType, setRecipeType] = useState<'colors' | 'theme'>('colors');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);

  const handleBuildDeck = () => {
    const recipe = {
      type: recipeType,
      value: recipeType === 'colors' ? selectedColors : selectedTheme
    };
    const finalDeck = buildDeck(collection, recipe);
    onDeckBuild(finalDeck); // <-- CALL THE NEW FUNCTION instead of alerting
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };
  
  // ... (The entire 'return (...)' part of the component stays exactly the same)
  return (
    <section className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Step 2: Choose Your Recipe</h2>
      <p className="mb-6 text-lg text-gray-600">
        Now, tell the Deckbot what kind of deck to build from your {collection.length} available cards.
      </p>

      <div className="flex gap-8 mb-6">
        <label className="flex items-center text-lg">
          <input type="radio" name="recipeType" value="colors"
            checked={recipeType === 'colors'} onChange={() => setRecipeType('colors')}
            className="w-5 h-5"
          />
          <span className="ml-2">By Colors</span>
        </label>
        <label className="flex items-center text-lg">
          <input type="radio" name="recipeType" value="theme"
            checked={recipeType === 'theme'} onChange={() => setRecipeType('theme')}
            className="w-5 h-5"
          />
          <span className="ml-2">By Theme</span>
        </label>
      </div>

      {recipeType === 'colors' && (
        <div className="flex gap-4 mb-6">
          {['W', 'U', 'B', 'R', 'G'].map(color => (
            <label key={color} className={`p-3 border-2 rounded-lg cursor-pointer ${selectedColors.includes(color) ? 'bg-blue-100 border-blue-400' : 'border-gray-200'}`}>
              <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => handleColorChange(color)} className="sr-only" />
              <span>{ {W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green'}[color] }</span>
            </label>
          ))}
        </div>
      )}

      {recipeType === 'theme' && (
        <div className="mb-6">
          <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)}
            className="p-3 border-2 border-gray-300 rounded-lg text-lg w-full md:w-1/3"
          >
            {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </div>
      )}

      <button onClick={handleBuildDeck}
        className="px-8 py-3 bg-violet-600 text-white font-bold text-lg rounded-full hover:bg-violet-700 disabled:bg-gray-400"
        disabled={recipeType === 'colors' && selectedColors.length === 0}
      >
        Build My Deck!
      </button>
    </section>
  );
}