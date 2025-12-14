'use strict';

module.exports = {
    name: 'inv',
    description: 'Creates an invite for the current server.',
    usage: '-inv',
    permission: 'owner',

    /**
     * Executes the inv command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        if (!message.guild) {
            return message.reply("❌ This command can only be used in a server.");
        }

        try {
            const invite = await message.channel.createInvite();
            await message.reply(`✅ **Invite Created:** ${invite.url}`);
        } catch (error) {
            console.error(`[inv] Failed to create invite for channel #${message.channel.name} in guild ${message.guild.name}:`, error);
            await message.reply("❌ **Failed to create invite.** This is likely because I don't have the 'Create Invite' permission in this channel.");
        }
    }
};
