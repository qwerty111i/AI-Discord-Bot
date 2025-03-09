import { storeUser, storeGlobal, viewUser, viewGlobal, deleteUser, 
    deleteGlobal } from "../database/memory.js";

async function storeUserInformation(userId, information) {
    try {
        const storedMessage = await storeUser(userId, information);
        return storedMessage
    } catch(e) {
        console.log(e);
        return "Something went wrong while storing this message!";
    }
}

async function storeGlobalInformation(information) {
    try {
        const storedMessage = await storeGlobal(information);
        return storedMessage;
    } catch(e) {
        return "Something went wrong while storing this global message!";
    }
}

async function viewUserInformation(userId) {
    try {
        const storedInformation = await viewUser(userId);
        return storedInformation;
    } catch (e) {
        return "Something went wrong while accessing the stored information!";
    }
}

async function viewGlobalInformation(guild) {
    try {
        const storedInformation = await viewGlobal(guild);
        return storedInformation;
    } catch(e) {
        return "Something went wrong while accessing the stored information!";
    }
}

async function deleteUserInformation(userId, index) {
    try {
        const deletionMessage = await deleteUser(userId, index);
        return deletionMessage;
    } catch (e) {
        return "Something went wrong while trying to delete this user's information.";
    }
}

async function deleteGlobalInformation(index) {
    try {
        const deletionMessage = await deleteGlobal(index);
        return deletionMessage;
    } catch (e) {
        return "Something went wrong while trying to delete global information."
    }
}

export { storeUserInformation, storeGlobalInformation, viewUserInformation, viewGlobalInformation, 
    deleteUserInformation, deleteGlobalInformation };