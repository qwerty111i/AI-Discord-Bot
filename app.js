import 'dotenv/config';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { execute as askExecute } from './commands/ask.js'; // Import the execute function from ask.js

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { id, type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = data;

    // Test Command
    if (name === 'test') {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Hello, world! This is a test command!`,
        },
      });
    }

    // Ask Command
    if (name === 'ask') {
      const userQuestion = options?.find(option => option.name === 'question')?.value;

      if (!userQuestion) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Please provide a question to ask.',
          },
        });
      }

      // Execute ask.js
      const answer = await askExecute(userQuestion);

      // Send the answer back to the user
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: answer,
        },
      });
    }

    if (name === 'repeat') {
      // Get the user's message (assuming it's passed as a 'text' option)
      const userMessage = options?.find(option => option.name === 'text')?.value;

      if (!userMessage) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'You didn\'t provide anything to repeat!',
          },
        });
      }

      // Respond with the same message
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `You said: ${userMessage}`,
        },
      });
    }
  }

  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
