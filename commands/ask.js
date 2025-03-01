import { post } from 'axios';

export const name = 'ask';
export const description = 'Ask anything!';
export async function execute(interaction) {
    const userQuestion = interaction.options.getString('question'); // Get the question from the command options

    try {
        // Make a request to the Google Gemini API (or your desired AI API)
        require('dotenv').config();
        const response = await post('https://gemini.googleapis.com/v1/ask', {
            apiKey: process.env.GEMINI_API_KEY, // Make sure your API key is in your .env file
            question: userQuestion,
        });

        // Send the answer back to the user
        await interaction.reply(response.data.answer);
    } catch (error) {
        console.error(error);
        await interaction.reply('Sorry, something went wrong while trying to fetch the answer.');
    }
}
