// /src/app/page.tsx
"use client";

import { useState } from 'react';
import { CollectionUploader } from "@/components/CollectionUploader";
import { DeckRecipe } from '@/components/DeckRecipe';
import { DeckDisplay } from '@/components/DeckDisplay'; // Import our new component
import { Deck } from '@/lib/ai-architect'; // Import the Deck type
import { ScryfallCard } from '@/lib/scryfall'; // <-- Change path here

export default function HomePage() {
  const [cardCollection, setCardCollection] = useState<ScryfallCard[]>([]);
  const [finalDeck, setFinalDeck] = useState<Deck | null>(null); // <-- NEW STATE for the final deck
  const [error, setError] = useState<string | null>(null);

  const handleCollectionLoad = (cards: ScryfallCard[], loadError: string | null) => {
    setCardCollection(cards);
    setError(loadError);
    setFinalDeck(null); // Reset deck if a new collection is uploaded
  };

  const handleDeckBuild = (deck: Deck) => {
    setFinalDeck(deck); // <-- NEW HANDLER to receive the built deck
  };
  
  const handleReset = () => {
    setCardCollection([]);
    setFinalDeck(null);
    setError(null);
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Casper's Deckbot 3000</h1>

      {/* If we have a final deck, show it and a reset button */}
      {finalDeck ? (
        <>
          <DeckDisplay deck={finalDeck} />
          <button onClick={handleReset} className="mt-8 px-8 py-3 bg-gray-600 text-white font-bold text-lg rounded-full hover:bg-gray-700">
            Build Another Deck
          </button>
        </>
      ) : (
        <>
          {/* Otherwise, show the uploader and recipe components */}
          <p className="mb-8 text-lg text-gray-600">
            Upload your card collection as a CSV file to get started.
          </p>
          <CollectionUploader onCollectionLoad={handleCollectionLoad} />
          {error && <p className="mt-4 text-lg text-red-600">Error: {error}</p>}
          {cardCollection.length > 0 && !error && (
            <div className="mt-10">
              <hr className="mb-10 border-dashed" />
              <DeckRecipe collection={cardCollection} onDeckBuild={handleDeckBuild} />
            </div>
          )}
        </>
      )}
    </main>
  );
}