'use strict';

module.exports = {
    name: 'remove',
    description: 'Removes a user from the bot administrators.',
    usage: '-remove <userID>',
    permission: 'owner', // Only the owner can use this command

    /**
     * Executes the remove command.
     * @param {Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const userIdToRemove = args[0];

        // --- Validation ---
        if (!userIdToRemove) {
            return message.reply({ content: `❌ **Usage:** 
${this.usage}
` });
        }

        if (!/^\d{17,19}$/.test(userIdToRemove)) {
            return message.reply({ content: '❌ **Invalid User ID:** Please provide a valid user ID.' });
        }

        if (userIdToRemove === client.permissions.ownerId) {
            return message.reply({ content: '❌ The owner cannot be removed.' });
        }

        // --- Logic ---
        const result = client.permissions.removeAdmin(userIdToRemove);

        if (result.success) {
            try {
                const user = await client.users.fetch(userIdToRemove);
                 await message.reply({ content: `✅ **Success!** 
`${user.tag}
` has been removed from the admin list.` });
            } catch (error) {
                console.error("Could not fetch user details for the removed admin, but they were removed successfully.", error);
                await message.reply({ content: `✅ **Success!** User with ID 
`${userIdToRemove}
` has been removed from the admin list. I could not fetch their username.` });
            }
        } else {
            await message.reply({ content: `💡 **Info:** ${result.message}` });
        }
    }
};
