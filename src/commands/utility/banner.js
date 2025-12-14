'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'banner',
    description: 'Displays the banner of a user.',
    usage: '-banner [@user/ID]',
    permission: 'owner',

    /**
     * Executes the banner command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        let targetUser;
        try {
            // Determine the target user
            const mentionedUser = message.mentions.users.first();
            const userId = args[0];

            if (mentionedUser) {
                targetUser = mentionedUser;
            } else if (userId) {
                targetUser = await client.users.fetch(userId);
            } else {
                targetUser = message.author;
            }

            if (!targetUser) {
                return message.reply("❌ **User Not Found.** Could not find the specified user.");
            }

            // Force fetch the user to get updated profile data, including the banner
            await targetUser.fetch({ force: true });

            const bannerUrl = targetUser.bannerURL({ dynamic: true, size: 4096 });

            if (!bannerUrl) {
                return message.reply("ℹ️ This user does not have a banner.");
            }

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setAuthor({ name: `${targetUser.tag}'s Banner`, iconURL: targetUser.displayAvatarURL({ dynamic: true }) })
                .setURL(bannerUrl)
                .setImage(bannerUrl)
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("[banner] Error fetching user or banner:", error);
            return message.reply("❌ **Invalid ID or Error.** Please provide a valid user mention or ID.");
        }
    }
};
