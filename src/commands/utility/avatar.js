'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'avatar',
    description: 'Displays the avatar of a user.',
    usage: '-avatar [@user/ID]',
    permission: 'owner',

    /**
     * Executes the avatar command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        let user;
        try {
            // Strategy 1: Check for mentions
            if (message.mentions.users.first()) {
                user = message.mentions.users.first();
            } 
            // Strategy 2: Check for a user ID in arguments
            else if (args[0]) {
                user = await client.users.fetch(args[0]);
            } 
            // Strategy 3: Default to the message author
            else {
                user = message.author;
            }

            if (!user) {
                return message.reply("❌ **User Not Found.** Could not find the specified user.");
            }

            const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 4096 });

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Avatar for ${user.tag}`)
                .setURL(avatarUrl)
                .setImage(avatarUrl)
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("[avatar] Error fetching user or sending embed:", error);
            return message.reply("❌ **Invalid ID or Error.** Please provide a valid user mention or ID.");
        }
    }
};
