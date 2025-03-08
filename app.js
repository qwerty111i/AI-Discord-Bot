import { Client, GatewayIntentBits, Events } from 'discord.js';
import { askExecute } from './commands/ask.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'test') {
    await interaction.deferReply();
    await interaction.editReply('Pong!');
  }

  if (interaction.commandName === 'ask') {
    const userQuestion = interaction.options.getString('question');

    if (!userQuestion) {
      interaction.reply("You didn\'t give me anything to answer.");
    }

    await interaction.deferReply();

    // Execute ask.js
    const answer = await askExecute(interaction.member, userQuestion);
    await interaction.editReply(answer);
  }
});

client.login(token);