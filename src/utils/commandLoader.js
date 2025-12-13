const fs = require('fs');
const path = require('path');
const { Collection } = require('@discordjs/collection');

/**
 * Loads all command files from the commands directory and its subdirectories.
 * @param {Client} client The Discord client instance.
 */
function loadCommands(client) {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '..', 'commands');
    let commandCount = 0;

    // Recursive function to read directories
    function readCommands(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // If it's a directory, recurse into it
                readCommands(fullPath);
            } else if (file.endsWith('.js')) {
                // If it's a JavaScript file, load it as a command
                try {
                    const command = require(fullPath);
                    if (command.name && typeof command.execute === 'function') {
                        // Inject the path for categorization purposes in the help command
                        command.__path = fullPath; 
                        client.commands.set(command.name, command);
                        console.log(`[Command Loader] Loaded command: ${command.name}`);
                        commandCount++;
                    } else {
                        console.warn(`[Command Loader] The file at ${fullPath} is missing a required "name" or "execute" property.`);
                    }
                } catch (error) {
                    console.error(`[Command Loader] Error loading command at ${fullPath}:`, error);
                }
            }
        }
    }

    readCommands(commandsPath);
    console.log(`[Command Loader] Successfully loaded ${commandCount} commands.`);
}

module.exports = {
    loadCommands
};
