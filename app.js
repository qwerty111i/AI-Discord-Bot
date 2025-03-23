import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;

// Creating a new client instance
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildExpressions
] });

client.commands = new Collection();

// Loading commands from /commands
const commandPath = join(process.cwd(), 'commands');
const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const { data, execute } = await import(`./commands/${file}`);
  client.commands.set(data.name, { data, execute });
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for interactions
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

client.login(token);