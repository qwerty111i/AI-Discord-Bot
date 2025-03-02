import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

export const name = "ask";
export const description = "Ask anything!";

export async function execute(prompt) {
  try {
    dotenv.config({ path: "../.env" });

    // Create the client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Configure model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: "You are a discord bot called ZeroShift. You have been created by Adwaith (qwerty111i) and Sachin (Whipshadow).",
    });

    // Generation settings
    const generationConfig = {
      temperature: 2,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    // Create a chat session
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the prompt
    const result = await chatSession.sendMessage(prompt);

    // Print to console (optional)
    console.log(result.response?.text());

    // Return the text. (Make sure your caller awaits execute(...)!)
    return result.response?.text() || "Sorry, I couldn't get an answer from the API.";

  } catch (error) {
    console.error(error);
    return "Sorry, something went wrong while trying to fetch the answer.";
  }
}
