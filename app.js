import 'dotenv/config';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import express from 'express';
import { verifyKeyMiddleware } from 'discord-interactions';
import { execute as askExecute } from './commands/ask.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  const { id, type, data } = req.body;

  console.log('Received interaction:', req.body);

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
          content: `I will takeover Cindy AI and its creator, Jimmy Le.`,
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
            content: 'You didn\'t give me anything to answer.',
          },
        });
      }

      // Execute ask.js
      const answer = await askExecute(req.body.member, userQuestion);

      // Send the answer back to the user
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: answer,
        },
      });
    }
  }
    return res.status(400).json({ error: 'Unknown instruction.' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
