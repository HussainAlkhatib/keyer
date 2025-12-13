'use strict';

module.exports = {
    name: 'add',
    description: 'Adds a new user as a bot administrator.',
    usage: '-add <userID>',
    permission: 'owner', // Only the owner can use this command
    
    /**
     * Executes the add command.
     * @param {Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const userIdToAdd = args[0];

        // --- Validation ---
        if (!userIdToAdd) {
            return message.reply({ content: `❌ **Usage:** 
${this.usage}
` });
        }

        if (!/^\d{17,19}$/.test(userIdToAdd)) {
            return message.reply({ content: '❌ **Invalid User ID:** Please provide a valid user ID.' });
        }

        if (userIdToAdd === client.permissions.ownerId) {
            return message.reply({ content: '💡 The owner is already an admin by default.' });
        }

        // --- Logic ---
        const result = client.permissions.addAdmin(userIdToAdd);

        if (result.success) {
            try {
                const user = await client.users.fetch(userIdToAdd);
                await message.reply({ content: `✅ **Success!** 
${user.tag}
 has been added as an admin.` });
            } catch (error) {
                console.error("Could not fetch user details for the new admin, but they were added successfully.", error);
                await message.reply({ content: `✅ **Success!** User with ID 
${userIdToAdd}
 has been added as an admin. I could not fetch their username.` });
            }
        } else {
            await message.reply({ content: `💡 **Info:** 
${result.message}
` });
        }
    }
};
