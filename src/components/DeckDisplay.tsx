// /src/components/DeckDisplay.tsx
"use client";

// THE FIX IS HERE: We import Deck from ai-architect and ScryfallCard from scryfall
import { Deck } from "@/lib/ai-architect";
import { ScryfallCard } from "@/lib/scryfall";


// Define a specific type for our counted card objects
type CardCount = {
  count: number;
  card: ScryfallCard;
};

// Helper component for a single card row
function CardRow({ card, count }: CardCount) {
  // We use Tailwind's 'group' feature for the hover effect
  return (
    <div className="relative group flex justify-between p-2 hover:bg-violet-100 rounded-md text-gray-800">
      <div>
        <span className="font-semibold">{count}x</span> {card.name}
      </div>
      {/* This is the hidden card image that appears on hover */}
      {card.image_uris?.normal && (
        <div 
          className="hidden group-hover:block absolute z-10 top-0 left-full ml-4 w-64"
        >
          <img 
            src={card.image_uris.normal} 
            alt={card.name}
            className="rounded-xl shadow-xl border-4 border-white"
          />
        </div>
      )}
    </div>
  );
}

export function DeckDisplay({ deck }: { deck: Deck }) {
  // Helper to count card quantities from a list
  const countCards = (cardList: ScryfallCard[]): Record<string, CardCount> => {
    return cardList.reduce((acc, card) => {
      acc[card.name] = {
        count: (acc[card.name]?.count || 0) + 1,
        card: card,
      };
      return acc;
    }, {} as Record<string, CardCount>);
  };
  
  const creatureCounts = countCards(deck.creatures);
  const spellCounts = countCards(deck.spells);
  const landCounts = countCards(deck.lands);

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-center text-violet-800">Your AI-Generated Deck!</h2>
      
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Column 1: Creatures */}
        <div>
          <h3 className="text-2xl font-semibold mb-3 border-b-2 border-gray-200 pb-2">Creatures ({deck.creatures.length})</h3>
          <div className="space-y-1">
            {Object.values(creatureCounts).map(({ card, count }) => (
              <CardRow key={card.id} card={card} count={count} />
            ))}
          </div>
        </div>
        
        {/* Column 2: Spells */}
        <div>
          <h3 className="text-2xl font-semibold mb-3 border-b-2 border-gray-200 pb-2">Spells ({deck.spells.length})</h3>
          <div className="space-y-1">
            {Object.values(spellCounts).map(({ card, count }) => (
              <CardRow key={card.id} card={card} count={count} />
            ))}
          </div>
        </div>

        {/* Column 3: Lands & Mana Curve (Placeholder) */}
        <div>
          <h3 className="text-2xl font-semibold mb-3 border-b-2 border-gray-200 pb-2">Lands ({deck.lands.length})</h3>
          <div className="space-y-1">
            {Object.values(landCounts).map(({ card, count }) => (
              <CardRow key={card.id} card={card} count={count} />
            ))}
          </div>

          <h3 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-gray-200 pb-2">Mana Curve</h3>
          <div className="text-center text-gray-500 italic mt-4">
            (Mana Curve Chart - V2 Feature)
          </div>
        </div>
      </div>
    </section>
  );
}