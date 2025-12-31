const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(folderPath, file));
        if ('data' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(config.token);

(async () => {
    try {
        console.log(`[Deploy] Refreshing ${commands.length} application (/) commands...`);

        // Deploy to specific guild (faster for development)
        if (config.guildId) {
            const data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            console.log(`[Deploy] Successfully reloaded ${data.length} guild commands.`);
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            const data = await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands }
            );
            console.log(`[Deploy] Successfully reloaded ${data.length} global commands.`);
        }
    } catch (error) {
        console.error('[Deploy] Error:', error);
    }
})();
