'use strict';

const path = require('path');

module.exports = {
    name: 'help',
    description: 'Displays a list of available commands, or info about a specific command.',
    usage: '-help [command name]',
    permission: 'admin', // All authorized users can use help

    /**
     * Executes the help command.
     * @param {Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const commands = client.commands;
        const { prefix } = client.permissions;
        const isOwner = client.permissions.isOwner(message.author.id);

        // If a specific command is requested
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName);

            if (!command) {
                return message.reply({ content: "❌ That command doesn't exist." });
            }

            // Check if the user has permission to view this command's help
            if (command.permission === 'owner' && !isOwner) {
                return message.reply({ content: "❌ You do not have permission to view help for this command." });
            }

            let reply = `**Command: `${command.name}`**\n`;
            reply += `**Description:** ${command.description}\n`;
            reply += `**Usage:** `${command.usage}`\n`;
            reply += `**Permission:** ${command.permission === 'owner' ? 'Owner Only' : 'Admin'}\n`;

            return message.reply({ content: reply });
        }

        // If no specific command is requested, show all available commands grouped by category
        let reply = 'Here is a list of my commands:\n\n';
        const categorizedCommands = {};

        commands.forEach(command => {
            // Check permissions before showing
            if (command.permission === 'owner' && !isOwner) {
                return; // Skip owner commands if user is not owner
            }

            // Categorize by subdirectory path
            const category = path.basename(path.dirname(command.__path || ''));
            const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

            if (!categorizedCommands[categoryName]) {
                categorizedCommands[categoryName] = [];
            }
            categorizedCommands[categoryName].push(command);
        });

        for (const category in categorizedCommands) {
            reply += `**${category} Commands**\n`;
            categorizedCommands[category].forEach(cmd => {
                reply += `  `${prefix}${cmd.name}` - ${cmd.description}\n`;
            });
            reply += '\n';
        }

        reply += `\n*You can use `${prefix}help [command name]` to get more info on a specific command.*`;

        return message.reply({ content: reply });
    }
};

// We need to inject the path into the command module when loading it.
// This is a bit of a hack, but it's a clean way to get the category.
// Let's modify the commandLoader.js to do this.
// I will do this in the next step. For now, this command is ready.
