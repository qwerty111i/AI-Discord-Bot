import { Client, GatewayIntentBits, Events, MessageFlags } from 'discord.js';
import { askExecute } from './commands/ask.js';
import { getRecap } from './commands/recap.js';
import { storeUserInformation, storeGlobalInformation, viewUserInformation, viewGlobalInformation, 
  deleteUserInformation, deleteGlobalInformation } from './commands/store.js';
import './commands.js';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildExpressions
] });

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ping Command
  if (interaction.commandName === 'ping') {
    interaction.reply("I will takeover Cindy AI and its creator, Jimmy Le.");
  }

  // ask Command
  if (interaction.commandName === 'ask') {
    const userQuestion = interaction.options.getString('question');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    
    const answer = await askExecute(interaction.member, userQuestion, interaction.guild.id);
    await interaction.editReply(answer);
  }

  // math Command
  if (interaction.commandName === 'math') {
    const userQuestion = interaction.options.getString('problem');

    if (!userQuestion) {
      interaction.reply({ content: 'You didn\'t give me anything to answer.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();
    
    const answer = await askExecute(interaction.member, userQuestion, interaction.guild.id);
    await interaction.editReply(answer);
  }

  // store Command
  if (interaction.commandName === 'store') {
    const userId = interaction.options.getString('user');
    const information = interaction.options.getString('information');

    if (!userId || !information) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    let storedMessage;
    if (userId !== 'global') {
      storedMessage = await storeUserInformation(userId, information);
    } else {
      storedMessage = await storeGlobalInformation(information);
    }
    await interaction.editReply(storedMessage);
  }

  // viewstored Command
  if (interaction.commandName === 'viewstored') {
    const userId = interaction.options.getString('user');
    const guildId = interaction.guild.id;

    if (!userId) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    let storedInformation;
    if (userId !== 'global') {
      storedInformation = await viewUserInformation(userId);
    } else {
      storedInformation = await viewGlobalInformation(guildId);
    }

    if (storedInformation === 'Something went wrong while accessing the stored information!' || 
      storedInformation === 'No information stored for this user!' || 
      storedInformation === 'No global information stored!') {
      interaction.editReply(storedInformation);
    } else {
      let printStoredInformation = "**" + storedInformation[0] + "**" + "\n";
      for (let i = 1; i < storedInformation.length; i++) {
        printStoredInformation += i + ". " + storedInformation[i] + "\n";
      }
      await interaction.editReply(printStoredInformation.toString());
    }
  }

  // deletestored Command
  if (interaction.commandName === 'deletestored') {
    const userId = interaction.options.getString('user');
    const index = interaction.options.getInteger('index') - 1;

    if (!userId) {
      interaction.reply({ content: 'Invalid inputs!', flags: MessageFlags.Ephemeral });
    }

    if (interaction.member.user.id !== '496802108540977162' && interaction.member.user.id !== '434110212933419009') {
      interaction.reply({ content: 'You are not authorized to use this command.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    let deletionMessage;
    if (userId !== 'global') {
      deletionMessage = await deleteUserInformation(userId, index);
    } else {
      deletionMessage = await deleteGlobalInformation(index);
    }
    await interaction.editReply(deletionMessage);
  }

  // recap Command
  if (interaction.commandName === 'recap') {
    const numMessages = interaction.options.getInteger('number');    
    if (numMessages < 1) {
      interaction.reply({ content: "Invalid message count!", flags: MessageFlags.Ephemeral });
    } else {
      const messages = await interaction.channel.messages.fetch({ limit: numMessages });
      await interaction.deferReply();
      const recap = await getRecap(messages);
      await interaction.editReply(recap);
    }
  }
});

client.login(token);