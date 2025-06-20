// /src/lib/scryfall.ts

// The one, authoritative definition for a Scryfall Card object.
// We are adding the 'image_uris' property here.
export type ScryfallCard = {
  id: string;
  name: string;
  colors?: string[];
  type_line: string;
  oracle_text?: string;
  mana_cost?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
  };
};

// The shape of the identifier object Scryfall's API expects.
type CardIdentifier = {
  id: string;
};

// This is our main function that the rest of the app will use.
export async function getCardsFromCollection(identifiers: CardIdentifier[]): Promise<ScryfallCard[]> {
  
  const API_URL = "https://api.scryfall.com/cards/collection";
  const CHUNK_SIZE = 75;

  const allFetchedCards: ScryfallCard[] = [];

  for (let i = 0; i < identifiers.length; i += CHUNK_SIZE) {
    const chunk = identifiers.slice(i, i + CHUNK_SIZE);
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifiers: chunk }),
      });

      if (!response.ok) {
        throw new Error(`Scryfall API error! Status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        allFetchedCards.push(...result.data);
      }

    } catch (error) {
      console.error("Failed to fetch card collection:", error);
      throw error;
    }
  }

  console.log(`Total cards fetched: ${allFetchedCards.length}`);
  return allFetchedCards;
}