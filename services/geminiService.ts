import { GoogleGenAI, Type } from "@google/genai";
import { Project, Screen } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAppStructure = async (
  prompt: string,
  platform: 'web' | 'mobile'
): Promise<Screen[]> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return [];
  }

  const systemInstruction = `
    You are an expert UI/UX architect for a No-Code platform.
    Your task is to generate a JSON structure for a ${platform} application based on the user's description.
    You must create a list of screens. Each screen should have a logical name, x/y coordinates (spread them out for a flow chart, x between 0-800, y between 0-600),
    connections (ids of other screens it flows to), and a list of components.
    
    Available component types: 'Button', 'Input', 'Text', 'Image', 'Card', 'Header', 'List', 'Map', 'Group', 'Dropdown'.
    
    IMPORTANT: You can nest components inside a 'Group' component using the 'children' property.
    Use Groups to create layouts (e.g., row layouts, cards with specific content).
    
    Return a clean JSON array of Screen objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              connections: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              components: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    label: { type: Type.STRING },
                    props: { type: Type.OBJECT, properties: {} },
                    style: { type: Type.OBJECT, properties: {} },
                    children: { 
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT, 
                             properties: {
                                id: { type: Type.STRING },
                                type: { type: Type.STRING },
                                label: { type: Type.STRING }
                             }
                             // Recursive schema definition is tricky in simple JSON schema, 
                             // but the model usually understands the concept of nesting if the root is defined well.
                        }
                    } 
                  },
                  required: ["id", "type", "label"]
                }
              }
            },
            required: ["id", "name", "x", "y", "components", "connections"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Screen[];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return [];
  }
};