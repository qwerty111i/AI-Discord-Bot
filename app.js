import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest } from './utils.js';

// Create an express app
const app = express();
// Get port (default 3000)
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    // Handle the /test command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `hello world ${getRandomEmoji()}`,
        },
      });
    }

    // Handle the /ask command
    if (name === 'ask') {
      const userQuestion = options?.[0]?.value;  // Get the user's question from the command options

      if (!userQuestion) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please provide a question to ask.',
          },
        });
      }

      try {
        // Make a request to the Gemini API (or whichever AI service you're using)
        require('dotenv').config();
        const response = await axios.post('https://gemini.googleapis.com/v1/ask', {
          apiKey: process.env.GEMINI_API_KEY,
          question: userQuestion,
        });

        // Send the response back to Discord
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: response.data.answer || 'Sorry, I couldn\'t get an answer from the API.',
          },
        });
      } catch (error) {
        console.error('Error querying Gemini API:', error);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Sorry, there was an error when trying to fetch the answer.',
          },
        });
      }
    }
  }

  // Log unknown interaction types
  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
