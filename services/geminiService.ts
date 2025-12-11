import { GoogleGenAI, Type } from "@google/genai";
import { TravelData, NewsItem } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fetchTravelData = async (location: string, days: number): Promise<TravelData> => {
  const ai = getAIClient();

  const prompt = `
    Create a comprehensive, exciting, and visually descriptive travel guide for ${location}.
    The user is staying for ${days} days.
    
    The tone should be adventurous, inspiring, and helpful.
    
    Provide:
    1. A catchy tagline.
    2. A captivating introduction.
    3. Best time to visit.
    4. 5 top tourist attractions with a specific "image_keyword" that describes the place visually (e.g., "Eiffel Tower sunset") for fetching images.
    5. 3 Fun/Random facts.
    6. Typical weather for right now (assume current season).
    7. Essentials: 
       - Currency Name & Code (e.g. USD, EUR, JPY).
       - Exchange Rate: Estimated conversion rate from 1 INR (Indian Rupee) to the local currency (e.g., if 1 INR = 1.8 JPY, return 1.8).
       - 4 Local Cuisine highlights: Name, short tasty description, and an image keyword.
       - 4 Specific Safety tips.
       - General travel tips.
    8. A detailed day-by-day itinerary for ${days} days.
    9. Atmosphere: Choose one keyword that best fits the vibe of the place for background animation: 'sakura' (Japan/Korea spring), 'snow' (cold/mountains), 'ocean' (beach/island), 'forest' (nature/greenery), 'desert' (sand/hot), 'city' (urban/modern), or 'default'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location_name: { type: Type.STRING },
            country: { type: Type.STRING },
            tagline: { type: Type.STRING },
            introduction: { type: Type.STRING },
            best_time_to_visit: { type: Type.STRING },
            atmosphere: { type: Type.STRING, enum: ['sakura', 'snow', 'ocean', 'forest', 'desert', 'city', 'default'] },
            attractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  image_keyword: { type: Type.STRING }
                }
              }
            },
            fun_facts: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weather: {
              type: Type.OBJECT,
              properties: {
                condition: { type: Type.STRING },
                temperature: { type: Type.STRING },
                advice: { type: Type.STRING }
              }
            },
            essentials: {
              type: Type.OBJECT,
              properties: {
                currency_name: { type: Type.STRING },
                currency_code: { type: Type.STRING },
                exchange_rate_from_inr: { type: Type.NUMBER },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                local_cuisine: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      image_keyword: { type: Type.STRING }
                    }
                  }
                },
                safety_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                travel_tips: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TravelData;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Gemini API Error (Travel Data):", error);
    throw error;
  }
};

export const fetchTravelNews = async (location: string): Promise<NewsItem[]> => {
  const ai = getAIClient();
  
  const prompt = `Find top 10 recent news or interesting cultural events happening in or relevant to ${location} for tourists. Return a JSON array of objects. Each object must have a 'headline', 'summary' (short), and 'date'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    
    if (jsonMatch) {
       try {
         const jsonStr = jsonMatch[1] || jsonMatch[0];
         return JSON.parse(jsonStr);
       } catch (e) {
         console.warn("Failed to parse news JSON", e);
       }
    }
    
    return [
      {
        headline: `Latest Updates for ${location}`,
        summary: "Check local listings for the most up-to-date events and news as the AI gathered general information.",
        date: "Today"
      }
    ];

  } catch (error) {
    console.error("Gemini API Error (News):", error);
    return [];
  }
};