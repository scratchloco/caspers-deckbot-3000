// /src/components/DeckRecipe.tsx
"use client";

import { useState } from 'react';
import { buildDeck, Deck } from '../lib/ai-architect';
import { ScryfallCard } from '../lib/scryfall';

type RecipeProps = {
  collection: ScryfallCard[];
  onDeckBuild: (deck: Deck) => void; 
};

// ... (Loader and THEMES constant remain the same)
const THEMES = [ 'Angel', 'Demon', 'Dragon', 'Elf', 'Goblin', 'Merfolk', 'Sliver', 'Soldier', 'Spirit', 'Vampire', 'Wizard', 'Zombie', 'Artifacts', 'Burn', 'Counters (+1/+1)', 'Enchantments', 'Graveyard', 'Lifegain', 'Mill', 'Ramp', 'Tokens'];


export function DeckRecipe({ collection, onDeckBuild }: RecipeProps) {
  const [recipeType, setRecipeType] = useState<'colors' | 'theme'>('colors');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleBuildDeck = async () => {
    // THIS IS THE ONLY TEST WE CARE ABOUT RIGHT NOW
    console.log("--- 'Build My Deck' BUTTON CLICKED! ---"); 

    setIsBuilding(true);
    const recipe = {
      type: recipeType,
      value: recipeType === 'colors' ? selectedColors : selectedTheme
    };
    try {
      const finalDeck = await buildDeck(collection, recipe);
      onDeckBuild(finalDeck);
    } catch (error) {
      console.error("Deck building failed:", error);
    }
    setIsBuilding(false); 
  };

  const handleColorChange = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };
  
  return (
    <section className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Choose Your Recipe</h2>
      {/* ... (The rest of the JSX is unchanged) */}
      <div className="flex gap-8 mb-6">
        <label className="flex items-center text-lg">
          <input type="radio" name="recipeType" value="colors" checked={recipeType === 'colors'} onChange={() => setRecipeType('colors')} className="w-5 h-5" disabled={isBuilding}/>
          <span className="ml-2">By Colors</span>
        </label>
        <label className="flex items-center text-lg">
          <input type="radio" name="recipeType" value="theme" checked={recipeType === 'theme'} onChange={() => setRecipeType('theme')} className="w-5 h-5" disabled={isBuilding}/>
          <span className="ml-2">By Theme</span>
        </label>
      </div>

      {recipeType === 'colors' && (
        <div className="flex flex-wrap gap-4 mb-6">
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
            disabled={isBuilding}
          >
            {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
          </select>
        </div>
      )}
      
      <button onClick={handleBuildDeck}
        className="px-8 py-3 w-64 h-14 bg-violet-600 text-white font-bold text-lg rounded-full hover:bg-violet-700 disabled:bg-gray-400 flex items-center justify-center"
        disabled={(recipeType === 'colors' && selectedColors.length === 0) || isBuilding}
      >
        {isBuilding ? 'Building...' : 'Build My Deck!'}
      </button>
    </section>
  );
}