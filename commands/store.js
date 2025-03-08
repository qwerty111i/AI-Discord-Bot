import { storeInformation, getStoredInformation } from "../database/memory.js";

export async function storeUserInformation(userId, information) {
    let storedCorrectly = false;
    try {
        await storeInformation(userId, information);
        storedCorrectly = true;
    } catch(e) {
        storedCorrectly = false
    }
    return storedCorrectly;
}

export async function viewUserStoredInformation(userId) {
    const userStoredInformation = await getStoredInformation(userId);
    if (!userStoredInformation) {
        return "No information stored for this user.";
    }
    return userStoredInformation;
}