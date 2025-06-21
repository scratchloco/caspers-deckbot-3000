// /src/components/DeckDisplay.tsx
"use client";

import { Deck } from "@/lib/ai-architect";
import { ScryfallCard } from "@/lib/scryfall";

type CardCount = {
  count: number;
  card: ScryfallCard;
};

function CardRow({ card, count }: CardCount) {
  return (
    <div className="relative group flex justify-between p-2 hover:bg-violet-100 rounded-md text-gray-800">
      <div>
        <span className="font-semibold">{count}x</span> {card.name}
      </div>
      {card.image_uris?.normal && (
        <div className="hidden group-hover:block absolute z-10 top-0 left-full ml-4 w-64">
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

function CardList({ title, cardList }: { title: string, cardList: ScryfallCard[] }) {
  const countCards = (list: ScryfallCard[]): Record<string, CardCount> => {
    return (list || []).reduce((acc, card) => {
      acc[card.name] = {
        count: (acc[card.name]?.count || 0) + 1,
        card: card,
      };
      return acc;
    }, {} as Record<string, CardCount>);
  };

  const cardCounts = countCards(cardList);

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-3 border-b-2 border-gray-200 pb-2">{title} ({cardList?.length || 0})</h3>
      <div className="space-y-1">
        {Object.values(cardCounts)
          .sort((a, b) => a.card.name.localeCompare(b.card.name))
          .map(({ card, count }) => (
            <CardRow key={card.id} card={card} count={count} />
        ))}
      </div>
    </div>
  );
}

export function DeckDisplay({ deck }: { deck: Deck }) {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6 text-center text-violet-800">Your AI-Generated Deck!</h2>
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <CardList title="Creatures" cardList={deck.creatures} />
        <CardList title="Spells" cardList={deck.spells} />
        <div>
          <CardList title="Lands" cardList={deck.lands} />
          <h3 className="text-2xl font-semibold mt-8 mb-3 border-b-2 border-gray-200 pb-2">Mana Curve</h3>
          <div className="text-center text-gray-500 italic mt-4">
            (Mana Curve Chart - V2 Feature)
          </div>
        </div>
      </div>
    </section>
  );
}