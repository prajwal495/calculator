import { GoogleGenAI } from "@google/genai";
import { DragonResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
// We will create a new instance per call to ensure we use the latest key if needed, 
// though for this simplified app, a singleton pattern with environment variable is fine.
const getAiClient = () => new GoogleGenAI({ apiKey });

export const askTheDragon = async (query: string): Promise<DragonResponse> => {
  if (!apiKey) {
    return {
      answer: "Error",
      flavorText: "The Dragon sleeps... (API Key missing)"
    };
  }

  try {
    const ai = getAiClient();
    
    // Using gemini-3-flash-preview for speed and reasoning
    const modelId = "gemini-3-flash-preview";
    
    const prompt = `
      You are an ancient, wise, and slightly arrogant Red Dragon who loves mathematics.
      User Query: "${query}"
      
      Your goal:
      1. Solve the math problem or answer the question accurately.
      2. Provide a short, thematic "flavor text" commentary as a dragon.
      
      Output ONLY valid JSON in this format:
      {
        "answer": "The numerical or short text answer",
        "flavorText": "A brief, 1-sentence dragon commentary."
      }
      Do not include markdown code blocks. Just the raw JSON string.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from the Dragon.");
    }

    const parsed = JSON.parse(text) as DragonResponse;
    return parsed;

  } catch (error) {
    console.error("Dragon Error:", error);
    return {
      answer: "Fizzle...",
      flavorText: "The magical energies are unstable. I cannot compute that right now."
    };
  }
};
