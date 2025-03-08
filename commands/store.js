import { storeInformation, getStoredInformation, deleteStoredInformation } from "../database/memory.js";

async function storeUserInformation(userId, information) {
    let storedCorrectly = false;
    try {
        await storeInformation(userId, information);
        storedCorrectly = true;
    } catch(e) {
        storedCorrectly = false
    }
    return storedCorrectly;
}

async function viewUserStoredInformation(userId) {
    const userStoredInformation = await getStoredInformation(userId);
    if (!userStoredInformation) {
        return "No information stored for this user.";
    }
    return userStoredInformation;
}

async function deleteUserStoredInformation(userId, index) {
    const successfulOperation = await deleteStoredInformation(userId, index);
    if (successfulOperation !== "Deletion operation failed!") {
        return "The following memory was deleted: " + successfulOperation;
    } else {
        return successfulOperation;
    }
}

export { storeUserInformation, viewUserStoredInformation, deleteUserStoredInformation };