import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;
const guildId = "1293953828256878685";

const commands = [];

async function loadCommands() {
  const commandPath = join(process.cwd(), 'commands');
  const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandPath, file);
    const fileUrl = `file://${filePath}`;

    const command = await import(fileUrl);
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    await loadCommands();

    console.log(`Refreshing ${commands.length} commands`);

    // Routes.applicationCommands(clientId),
    // Routes.applicationGuildCommands(clientId, guildId),

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
  } catch (error) {
    console.error(error);
  }
})();
