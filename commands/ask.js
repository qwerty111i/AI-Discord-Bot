import { GoogleGenerativeAI } from "@google/generative-ai";
export const name = 'ask';
export const description = 'Ask anything!';
import dotenv from 'dotenv';

export async function execute(prompt) {
    try {
        dotenv.config({ path: '../.env' });
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        console.log(result.response.text());

        return result.response.text() || 'Sorry, I couldn\'t get an answer from the API.';
    } catch (error) {
        console.error(error);
        return 'Sorry, something went wrong while trying to fetch the answer.';
    }
}




