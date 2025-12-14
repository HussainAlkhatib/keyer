'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'userinfo',
    description: 'Displays detailed information about a user.',
    usage: '-userinfo [@user/ID]',
    permission: 'owner',

    /**
     * Executes the userinfo command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        if (!message.guild) {
            return message.reply("❌ This command must be used in a server to get full user details.");
        }

        try {
            // Determine the target user
            let user;
            const mentionedUser = message.mentions.users.first();
            const userId = args[0];

            if (mentionedUser) {
                user = mentionedUser;
            } else if (userId) {
                user = await client.users.fetch(userId);
            } else {
                user = message.author;
            }

            if (!user) {
                return message.reply("❌ **User Not Found.** Please provide a valid mention or ID.");
            }

            // Fetch the GuildMember object to get server-specific info
            const member = await message.guild.members.fetch(user.id);
            if (!member) {
                 return message.reply("❌ **Member Not Found.** The specified user is not in this server.");
            }

            // Format roles
            const roles = member.roles.cache
                .filter(r => r.id !== message.guild.id) // Exclude @everyone role
                .map(r => r.toString())
                .join(', ') || 'None';

            const embed = new MessageEmbed()
                .setColor(member.displayHexColor === '#000000' ? '#95a5a6' : member.displayHexColor)
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true })})
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .addField('User ID', `\`${user.id}\``, true)
                .addField('Bot Account', `\`${user.bot ? 'Yes' : 'No'}\``, true)
                .addField('\u200b', '\u200b')
                .addField('Account Created', `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, true)
                .addField('Joined Server', `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, true)
                .addField(`Roles [${member.roles.cache.size - 1}]`, roles.length > 1024 ? 'Too many to display' : roles)
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
            
            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('[userinfo] Error fetching user info:', error);
            await message.reply("❌ An error occurred. The user ID might be invalid or they may not be in this server.");
        }
    }
};
