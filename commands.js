import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;
const guildId = "1293953828256878685";

// Define your command(s)
const commands = [];
const commandPath = join(process.cwd(), 'commands');
const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const { data } = await import(`./commands/${file}`);
  commands.push(data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {        
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

  } catch (error) {
    console.error(error);
  }
})();
