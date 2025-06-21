// /src/app/api/score-cards/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function runGeminiAnalysis(cardNames: string[], deckContext: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const masterPrompt = `
    You are an expert Magic: The Gathering deck-building assistant. 
    Your task is to evaluate a list of cards based on a given deck-building context.
    Please return a valid JSON object. The root key must be "card_scores".
    The value of "card_scores" must be an array of objects.
    Each object in the array must have two keys: "name" (the card's name as a string) and "score" (an integer from 1 to 10).
    A score of 10 means the card is an essential, auto-include for the theme. 
    A score of 1 means the card has almost no synergy or is actively bad in the deck.
    Deck-building Context: ${deckContext}
    List of Card Names: ${JSON.stringify(cardNames)}
  `;

  const result = await model.generateContent(masterPrompt);
  const response = result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini response was not valid JSON:", text);
    throw new Error("Failed to parse AI response.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cardNames, deckContext } = body;
    if (!cardNames || !deckContext || !Array.isArray(cardNames) || cardNames.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid cardNames/deckContext in request body' }, { status: 400 });
    }
    const scores = await runGeminiAnalysis(cardNames, deckContext);
    return NextResponse.json(scores);
  } catch (error: any) {
    console.error("--- GEMINI API BACKEND ERROR ---", error);
    return NextResponse.json({ 
      error: 'Failed to get a response from the Gemini API.', 
      details: error.message || 'An unknown error occurred on the backend.' 
    }, { status: 500 });
  }
}