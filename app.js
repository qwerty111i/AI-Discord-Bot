import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import { askExecute } from './commands/ask.js';
import { storeUserInformation, viewUserStoredInformation } from './commands/store.js';
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
    interaction.reply("I will takeover Cindy AI and its creator, Jimmy Le.");
  }

  if (interaction.commandName === 'ask') {
    const userQuestion = interaction.options.getString('question');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    

    // Execute ask.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }

  if (interaction.commandName === 'math') {
    const userQuestion = interaction.options.getString('problem');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    
    // Execute math.js
    const answer = await askExecute(interaction.member, userQuestion);
    console.log(answer)
    await interaction.editReply(answer);
  }

  if (interaction.commandName === 'store') {
    const userId = interaction.options.getString('user');
    const userInformation = interaction.options.getString('information');

    if (!userId || !userInformation) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedCorrectly = await storeUserInformation(userId, userInformation);
    if (storedCorrectly == true) {
      await interaction.editReply("Information has been stored!")
    } else {
      await interaction.editReply("Something went wrong...");
    }
  }

  if (interaction.commandName === 'viewstored') {
    const userId = interaction.options.getString('user');

    if (!userId) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== "496802108540977162" && interaction.member.user.id !== "434110212933419009") {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    // Execute store.js
    const storedInformation = await viewUserStoredInformation(userId);
    let printStoredInformation = "";
    for (let i = 0; i < storedInformation.length; i++) {
      printStoredInformation += (i + 1) + ". " + storedInformation[i] + "\n";
    }
    await interaction.editReply(printStoredInformation.toString());
  }
});

client.login(token);