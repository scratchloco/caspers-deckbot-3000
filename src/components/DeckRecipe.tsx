// /src/components/DeckRecipe.tsx
"use client";

import { useState } from 'react';
import { buildDeck, Deck, Recipe } from '../lib/ai-architect';
import { ScryfallCard } from '../lib/scryfall';

type RecipeProps = {
  collection: ScryfallCard[];
  onDeckBuild: (deck: Deck) => void; 
};

function Loader({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {text}
    </div>
  );
}

const THEMES = [ 'Angel', 'Demon', 'Dragon', 'Elf', 'Goblin', 'Merfolk', 'Sliver', 'Soldier', 'Spirit', 'Vampire', 'Wizard', 'Zombie', 'Artifacts', 'Burn', 'Counters (+1/+1)', 'Enchantments', 'Graveyard', 'Lifegain', 'Mill', 'Ramp', 'Tokens'];

export function DeckRecipe({ collection, onDeckBuild }: RecipeProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuildDeck = async () => {
    setIsBuilding(true);
    const recipe: Recipe = {
      type: 'theme_and_colors',
      value: {
        theme: selectedTheme,
        colors: selectedColors
      }
    };
    try {
      const finalDeck = await buildDeck(collection, recipe);
      onDeckBuild(finalDeck);
    } catch (error) {
      console.error("Deck building failed:", error);
      setIsBuilding(false);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };
  
  return (
    <section className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Step 2: Choose Your Recipe</h2>
      <p className="mb-6 text-lg text-gray-600">
        Choose colors and/or a theme to guide the Deckbot. At least one option is required.
      </p>

      {/* --- REORDERED UI --- */}

      {/* 1. Color selection is now first */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">Colors (Optional)</label>
        <div className="flex flex-wrap gap-4">
          {['W', 'U', 'B', 'R', 'G'].map(color => (
            <label key={color} className={`p-3 border-2 rounded-lg cursor-pointer ${selectedColors.includes(color) ? 'bg-blue-100 border-blue-400' : 'border-gray-200'}`}>
              <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => handleColorChange(color)} className="sr-only" disabled={isBuilding}/>
              <span>{ {W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green'}[color] }</span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Theme input is now second */}
      <div className="mb-6">
        <label htmlFor="theme-input" className="block text-lg font-medium text-gray-700 mb-2">Theme (Optional)</label>
        <input 
          type="text"
          id="theme-input"
          list="theme-suggestions"
          value={selectedTheme} 
          onChange={e => setSelectedTheme(e.target.value)}
          className="p-3 border-2 border-gray-300 rounded-lg text-lg w-full md:w-1/2"
          disabled={isBuilding}
          placeholder="e.g., Goblins, Lifegain, or leave blank"
        />
        <datalist id="theme-suggestions">
          {THEMES.map(theme => <option key={theme} value={theme} />)}
        </datalist>
      </div>
      
      {/* Build Button logic remains the same */}
      <button 
        onClick={handleBuildDeck}
        className="px-8 py-3 w-64 h-14 bg-violet-600 text-white font-bold text-lg rounded-full hover:bg-violet-700 disabled:bg-gray-400 flex items-center justify-center"
        disabled={isBuilding || (selectedTheme === '' && selectedColors.length === 0)}
      >
        {isBuilding ? <Loader text="Building..." /> : 'Build My Deck!'}
      </button>
    </section>
  );
}