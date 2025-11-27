
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
    You must create a list of screens. Each screen should have a logical name, x/y coordinates (IMPORTANT: Place screens vertically under each other in a single column, starting at y=100 and increasing y by 300 for each screen, keeping x=100),
    connections (ids of other screens it flows to), and a list of components.
    
    Available component types: 
    'Button', 'Input', 'Text', 'Image', 'Card', 'Header', 'List', 'Map', 'Group', 'Dropdown',
    'Checkbox', 'Switch', 'Slider', 'Avatar', 'Badge', 'Divider', 'TextArea'.
    
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
                    props: { 
                      type: Type.OBJECT, 
                      properties: {
                        variant: { type: Type.STRING },
                        placeholder: { type: Type.STRING },
                        text: { type: Type.STRING },
                        src: { type: Type.STRING },
                        collapsible: { type: Type.BOOLEAN },
                        collapsed: { type: Type.BOOLEAN },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        align: { type: Type.STRING },
                        size: { type: Type.STRING },
                        showImage: { type: Type.BOOLEAN },
                        defaultChecked: { type: Type.BOOLEAN },
                        min: { type: Type.NUMBER },
                        max: { type: Type.NUMBER },
                        step: { type: Type.NUMBER },
                        value: { type: Type.NUMBER }
                      } 
                    },
                    style: { 
                      type: Type.OBJECT, 
                      properties: {
                        backgroundColor: { type: Type.STRING },
                        color: { type: Type.STRING },
                        width: { type: Type.STRING },
                        height: { type: Type.STRING },
                        padding: { type: Type.NUMBER },
                        margin: { type: Type.NUMBER },
                        borderRadius: { type: Type.NUMBER },
                        borderWidth: { type: Type.NUMBER },
                        borderColor: { type: Type.STRING },
                        flexDirection: { type: Type.STRING },
                        justifyContent: { type: Type.STRING },
                        alignItems: { type: Type.STRING },
                        flexWrap: { type: Type.STRING },
                        gap: { type: Type.NUMBER },
                        fontWeight: { type: Type.STRING }
                      } 
                    },
                    children: { 
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT, 
                             properties: {
                                id: { type: Type.STRING },
                                type: { type: Type.STRING },
                                label: { type: Type.STRING },
                                props: {
                                  type: Type.OBJECT,
                                  properties: {
                                    variant: { type: Type.STRING },
                                    placeholder: { type: Type.STRING },
                                    text: { type: Type.STRING },
                                    src: { type: Type.STRING },
                                    collapsible: { type: Type.BOOLEAN },
                                    collapsed: { type: Type.BOOLEAN },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    align: { type: Type.STRING },
                                    size: { type: Type.STRING },
                                    showImage: { type: Type.BOOLEAN },
                                    defaultChecked: { type: Type.BOOLEAN },
                                    min: { type: Type.NUMBER },
                                    max: { type: Type.NUMBER },
                                    step: { type: Type.NUMBER },
                                    value: { type: Type.NUMBER }
                                  }
                                },
                                style: {
                                  type: Type.OBJECT,
                                  properties: {
                                    backgroundColor: { type: Type.STRING },
                                    color: { type: Type.STRING },
                                    width: { type: Type.STRING },
                                    height: { type: Type.STRING },
                                    padding: { type: Type.NUMBER },
                                    margin: { type: Type.NUMBER },
                                    borderRadius: { type: Type.NUMBER },
                                    borderWidth: { type: Type.NUMBER },
                                    borderColor: { type: Type.STRING },
                                    flexDirection: { type: Type.STRING },
                                    justifyContent: { type: Type.STRING },
                                    alignItems: { type: Type.STRING },
                                    flexWrap: { type: Type.STRING },
                                    gap: { type: Type.NUMBER },
                                    fontWeight: { type: Type.STRING }
                                  }
                                }
                             }
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