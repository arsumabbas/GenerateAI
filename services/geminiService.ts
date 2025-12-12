import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard } from "../types";

export interface GeneratedCard {
  front: string;
  back: string;
  tags: string[];
}

export const generateFlashcards = async (
  apiKey: string,
  content: string,
  count: number = 5,
  type: 'qa' | 'mcq' | 'cloze' = 'qa'
): Promise<GeneratedCard[]> => {
  if (!apiKey) throw new Error("API Key is required");

  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = `Create ${count} study flashcards from the following text. `;
  
  if (type === 'qa') {
    prompt += "Format them as Question and Answer pairs.";
  } else if (type === 'mcq') {
    prompt += "Format them as Multiple Choice Questions in the front, and the correct answer with explanation in the back.";
  } else if (type === 'cloze') {
    prompt += "Format them as fill-in-the-blank statements (cloze deletion).";
  }

  // Schema for structured output
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING, description: "The question or front side of the card" },
        back: { type: Type.STRING, description: "The answer or back side of the card" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relevant topic tags" }
      },
      required: ["front", "back"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] },
        { role: "user", parts: [{ text: `--- SOURCE TEXT ---\n${content.substring(0, 10000)}` }] } // Limit context window safety
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const cards: GeneratedCard[] = JSON.parse(jsonText);
    return cards;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};