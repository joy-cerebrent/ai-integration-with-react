import { GoogleGenAI } from "@google/genai";

export const askGemini = async (question) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: question,
  });

  return response.text;
}