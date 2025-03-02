import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const TEST_COMMAND = {
  name: 'test',
  description: 'To learn my backstory.',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ASK_COMMAND = {
  name: 'ask',
  description: 'Ask anything!',
  type: 1,
  options: [
    {
      name: 'question',
      description: 'What do you want to ask?',
      type: 3,  // Type 3 means it's a string
      required: true,  // The user must provide text
    },
  ],
};

const STORE_COMMAND = {
  name: 'store',
  description: 'Store anything!',
  type: 1,
  options: [
    {
      name: 'question',
      description: 'What do you want to store?',
      type: 3,  // Type 3 means it's a string
      required: true,  // The user must provide text
    },
  ],
};

const ALL_COMMANDS = [TEST_COMMAND, ASK_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
