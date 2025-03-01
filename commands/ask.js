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

        return result.response.text() || 'Sorry, I can\'t give you an answer.';
    } catch (error) {
        console.error(error);
        return 'Sorry, something went wrong while I was looking for the answer.';
    }
}




