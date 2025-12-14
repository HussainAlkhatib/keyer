'use strict';

const { MessageEmbed } = require('../../index.js');

module.exports = {
    name: 'serverinfo',
    description: 'Displays detailed information about the current server.',
    usage: '-serverinfo',
    permission: 'owner',

    /**
     * Executes the serverinfo command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        if (!message.guild) {
            return message.reply("❌ This command can only be used in a server.");
        }

        try {
            const guild = message.guild;
            const owner = await guild.fetchOwner();

            // Channel counts
            const channels = guild.channels.cache;
            const textChannels = channels.filter(c => c.type === 'GUILD_TEXT').size;
            const voiceChannels = channels.filter(c => c.type === 'GUILD_VOICE').size;
            const categories = channels.filter(c => c.type === 'GUILD_CATEGORY').size;

            // Boost status
            const tier = {
                'NONE': 'Tier 0',
                'TIER_1': 'Tier 1',
                'TIER_2': 'Tier 2',
                'TIER_3': 'Tier 3',
            };

            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Server Info: ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addField('Owner', `\`${owner.user.tag}\``, true)
                .addField('Server ID', `\`${guild.id}\``, true)
                .addField('Created On', `<t:${parseInt(guild.createdTimestamp / 1000)}:D>`, true) // Using Discord's timestamp format
                .addField('Members', `\`${guild.memberCount}\``, true)
                .addField('Verification', `\`${guild.verificationLevel}\``, true)
                .addField('\u200b', '\u200b') // Spacer
                .addField('Channels', `Total: \`${channels.size}\`
                - Text: \`${textChannels}\`
                - Voice: \`${voiceChannels}\`
                - Categories: \`${categories}\``, true)
                .addField('Roles', `\`${guild.roles.cache.size}\``, true)
                .addField('Boost Status', `\`${tier[guild.premiumTier]}\` with \`${guild.premiumSubscriptionCount || 0}\` boosts`, true)
                .setFooter({ text: `Requested by: ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("[serverinfo] Error fetching server info:", error);
            await message.reply("❌ An error occurred while trying to fetch server information.");
        }
    }
};
