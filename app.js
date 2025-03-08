import { Client, GatewayIntentBits, Events } from 'discord.js';
import { askExecute } from './commands/ask.js';
import dotenv from 'dotenv';
import './commands.js';
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
  //ask.js
  if (interaction.commandName === 'ask') {
    const userQuestion = interaction.options.getString('question');

    if (!userQuestion) {
      interaction.reply("You didn\'t give me anything to answer.");
    }

    await interaction.deferReply();
    

    // Execute ask.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }
  //math.js
  if (interaction.commandName === 'math') {
    const userQuestion = interaction.options.getString('problem');

    if (!userQuestion) {
      interaction.reply("You didn\'t give me anything to answer.");
    }

    await interaction.deferReply();
    

    // Execute math.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }

});

client.login(token);