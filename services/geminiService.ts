import { GoogleGenAI, Type } from "@google/genai";
import { FoodEntry } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFoodImage = async (base64Image: string): Promise<Omit<FoodEntry, 'id' | 'timestamp' | 'imageUrl'>> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image and identify the main food item. Estimate the calories and macronutrients (protein, carbs, fat) for the portion shown. If there are multiple items, provide an aggregate or the most prominent one. Return the data in JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the food item" },
            calories: { type: Type.NUMBER, description: "Estimated total calories" },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER, description: "Protein in grams" },
                carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                fat: { type: Type.NUMBER, description: "Fat in grams" }
              },
              required: ["protein", "carbs", "fat"]
            },
            confidence: { type: Type.STRING, description: "Low, Medium, or High confidence in the estimate" }
          },
          required: ["name", "calories", "macros"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw error;
  }
};
