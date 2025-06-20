// /src/components/CollectionUploader.tsx
"use client";

import React, { useState } from 'react';
import Papa from 'papaparse';
import { getCardsFromCollection, ScryfallCard } from '../lib/scryfall';

type CsvRow = { 'Scryfall ID': string; };

// Our component now accepts a prop: the onCollectionLoad function from the parent page.
type UploaderProps = {
  onCollectionLoad: (cards: ScryfallCard[], error: string | null) => void;
};

export function CollectionUploader({ onCollectionLoad }: UploaderProps) {
  // The component now only manages its own loading state.
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const identifiers = results.data
            .map(row => ({ id: row['Scryfall ID'] }))
            .filter(idObj => idObj.id);

          if (identifiers.length === 0) {
            throw new Error("No valid 'Scryfall ID' column found in the file.");
          }

          const fetchedCards = await getCardsFromCollection(identifiers);
          // Instead of setting its own state, it calls the function from the parent page.
          onCollectionLoad(fetchedCards, null);

        } catch (err: any) {
          onCollectionLoad([], err.message || 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      },
      error: (err: any) => {
        onCollectionLoad([], err.message);
        setIsLoading(false);
      }
    });
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="csv-upload" className="block text-lg font-medium text-gray-700 mb-2">
          Upload your Collection CSV:
        </label>
        <input
          type="file" id="csv-upload" accept=".csv"
          onChange={handleFileChange} disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>

      {isLoading && <p className="text-lg text-blue-600">Loading Collection...</p>}
      
      {/* The success/error messages will now be handled by the main page */}
    </div>
  );
}