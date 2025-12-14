'use strict';

const { MessageEmbed } = require('../../index.js');
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Displays a list of all available commands, or info about a specific command.',
    usage: '-help [command_name]',
    permission: 'owner',

    /**
     * Executes the help command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const { commands } = client;
        const prefix = client.permissions.prefix;

        // Case 1: Help for a specific command
        if (args[0]) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName);

            if (!command) {
                return message.reply(`❌ Command not found: \`${commandName}\`. Use \`${prefix}help\` to see all commands.`);
            }

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Help: \`${prefix}${command.name}\``)
                .addField('Description', command.description || 'No description provided.')
                .addField('Usage', `\`${command.usage || prefix + command.name}\``, true)
                .addField('Permission', `\`${command.permission || 'Default'}\``, true)
                .setFooter({ text: `Requested by: ${message.author.tag}`})
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        // Case 2: General help, listing all commands by category
        const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Command List')
            .setDescription(`Here are all the available commands. For more info on a specific command, type \`${prefix}help <command_name>\`.`)
            .setFooter({ text: `Requested by: ${message.author.tag}`})
            .setTimestamp();
            
        const categories = {};

        // Group commands by category using the file path
        for (const command of commands.values()) {
            // __path is injected by the commandLoader
            if (command.__path) {
                const category = path.basename(path.dirname(command.__path));
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(command.name);
            }
        }

        // Add a field for each category to the embed
        for (const categoryName in categories) {
            const capitalizedName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            const commandList = categories[categoryName].map(name => `\`${name}\``).join(', ');
            helpEmbed.addField(`📂 ${capitalizedName}`, commandList);
        }

        await message.reply({ embeds: [helpEmbed] });
    }
};