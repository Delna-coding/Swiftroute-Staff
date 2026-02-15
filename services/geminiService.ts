
import { GoogleGenAI, Type } from "@google/genai";
import { Ticket, Stop } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const predictOccupancy = async (
  busName: string,
  targetStop: Stop,
  currentTickets: Ticket[],
  stops: Stop[]
): Promise<{ predictedCount: number; reason: string }> => {
  const prompt = `
    Analyze the following real-time bus data for "${busName}".
    Route: ${stops.map(s => s.name).join(' -> ')}.
    Target Destination: ${targetStop.name}.
    Current booked tickets: ${JSON.stringify(currentTickets)}.
    
    Predict the total number of passengers likely to be on the bus when it reaches "${targetStop.name}". 
    Consider that existing tickets for that stop or further will be there, and estimate some random "unbooked" walk-in passengers (usually 10-20% of capacity).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedCount: { type: Type.NUMBER },
            reason: { type: Type.STRING },
          },
          required: ["predictedCount", "reason"],
        },
      },
    });

    const result = JSON.parse(response.text || '{"predictedCount": 0, "reason": "Error parsing"}');
    return result;
  } catch (error) {
    console.error("Prediction error:", error);
    // Fallback logic if API fails
    const currentOnboard = currentTickets.filter(t => t.destinationIdx >= targetStop.id).reduce((acc, t) => acc + t.count, 0);
    return { predictedCount: currentOnboard + 5, reason: "Manual calculation (API Offline)" };
  }
};
