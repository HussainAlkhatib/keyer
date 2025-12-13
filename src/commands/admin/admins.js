'use strict';

module.exports = {
    name: 'admins',
    description: 'Lists the owner and all bot administrators.',
    usage: '-admins',
    permission: 'admin', // Admins and the owner can see the list

    /**
     * Executes the admins command.
     * @param {Message} message The message object that triggered the command.
     * @param {string[]} args The arguments passed to the command.
     * @param {Client} client The Discord client instance.
     */
    async execute(message, args, client) {
        const ownerId = client.permissions.ownerId;
        const adminIds = client.permissions.getAdmins();

        let response = '👑 **Bot Owner:**\n';

        try {
            const ownerUser = await client.users.fetch(ownerId);
            response += `- ${ownerUser.tag} (${ownerId})\n\n`;
        } catch {
            response += `- Could not fetch owner details (${ownerId})\n\n`;
        }

        if (adminIds.length > 0) {
            response += '🛡️ **Bot Administrators:**\n';
            
            // Use Promise.all to fetch all admin user details concurrently
            const adminPromises = adminIds.map(id => 
                client.users.fetch(id).then(user => `- ${user.tag} (${id})`).catch(() => `- Could not fetch details for ${id}`)
            );
            
            const adminList = await Promise.all(adminPromises);
            response += adminList.join('\n');

        } else {
            response += '🛡️ There are no other administrators.';
        }

        await message.reply({ content: response });
    }
};
