'use strict';

module.exports = {
    name: 'clear',
    description: 'Deletes a specified number of messages from the current channel.',
    usage: '-clear <number>',
    permission: 'owner',

    /**
     * Executes the clear command.
     * @param {import('discord.js-selfbot-v13').Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {import('discord.js-selfbot-v13').Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        if (!message.guild) {
            return message.reply("❌ This command can only be used in a server.");
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            return message.reply(`❌ That doesn't seem to be a valid number.
**Usage:** \`${this.usage}\``);
        }

        if (amount <= 0 || amount > 100) {
            return message.reply("❌ You can only delete between 1 and 100 messages at a time.");
        }

        try {
            // We fetch one more message than requested to include the command message itself.
            const messagesToDelete = await message.channel.messages.fetch({ limit: amount + 1 });
            await message.channel.bulkDelete(messagesToDelete, true); // The 'true' filters messages older than 14 days

            const successMsg = await message.channel.send(`✅ Successfully deleted ${amount} messages.`);
            setTimeout(() => successMsg.delete().catch(console.error), 5000);

        } catch (error) {
            console.error('[clear] Error during bulk delete:', error);
            await message.reply("❌ **Failed to delete messages.** This could be because: \n- I don't have the 'Manage Messages' permission. \n- The messages are older than 14 days.");
        }
    }
};
