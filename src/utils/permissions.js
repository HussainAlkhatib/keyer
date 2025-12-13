const fs = require('fs');
const path = require('path');

// Load configuration and database files
const configPath = path.join(__dirname, '..', '..', 'config.json');
const dbPath = path.join(__dirname, '..', '..', 'db.json');

let config = {};
let db = { admins: [] };

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
    console.error("Error reading config.json:", error);
    // Exit or handle gracefully if config is critical
    process.exit(1);
}

try {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (error) {
    console.error("Error reading db.json, initializing with empty admins list.", error);
    // If db.json is missing or corrupt, we can start fresh
    db = { admins: [] };
}

/**
 * Saves the current state of the database (admins list) to db.json.
 */
function saveDb() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    } catch (error) {
        console.error("Fatal: Could not write to db.json.", error);
    }
}

/**
 * Checks if a user is the owner of the bot.
 * @param {string} userId The ID of the user to check.
 * @returns {boolean} True if the user is the owner.
 */
function isOwner(userId) {
    return userId === config.ownerId;
}

/**
 * Checks if a user is an admin or the owner.
 * @param {string} userId The ID of the user to check.
 * @returns {boolean} True if the user is an admin or the owner.
 */
function isAdmin(userId) {
    // The owner is always an admin.
    if (isOwner(userId)) {
        return true;
    }
    return db.admins.includes(userId);
}

/**
 * Adds a new user to the admin list.
 * @param {string} userId The ID of the user to add.
 * @returns {{success: boolean, message: string}} Result object.
 */
function addAdmin(userId) {
    if (db.admins.includes(userId)) {
        return { success: false, message: 'User is already an admin.' };
    }
    db.admins.push(userId);
    saveDb();
    return { success: true, message: `User ${userId} has been added as an admin.` };
}

/**
 * Removes a user from the admin list.
 * @param {string} userId The ID of the user to remove.
 * @returns {{success: boolean, message: string}} Result object.
 */
function removeAdmin(userId) {
    if (!db.admins.includes(userId)) {
        return { success: false, message: 'User is not an admin.' };
    }
    db.admins = db.admins.filter(id => id !== userId);
    saveDb();
    return { success: true, message: `User ${userId} has been removed from admins.` };
}

/**
 * Gets the list of all admin IDs.
 * @returns {string[]} An array of admin user IDs.
 */
function getAdmins() {
    return [...db.admins];
}

module.exports = {
    isOwner,
    isAdmin,
    addAdmin,
    removeAdmin,
    getAdmins,
    prefix: config.prefix,
    ownerId: config.ownerId
};
