const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(commandsPath);

    let commandCount = 0;

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);

        // Skip if not a directory
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));

            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                commandCount++;
            } else {
                console.log(`[Commands] Warning: ${file} is missing required "data" or "execute" property`);
            }
        }
    }

    console.log(`[Commands] Loaded ${commandCount} commands`);
};
