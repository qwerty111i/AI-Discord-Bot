import { connectToMongoDB } from './db.js';

// Storing user chat history
async function storeInteraction(userId, serverUsername, uniqueUsername, question, answer) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  if (userMemory) {
    await collection.updateOne(
        { userId },
        { 
          $addToSet: { permenant_username: { $each: [ uniqueUsername ] } },
          $addToSet: { server_nicknames: { $each: [ serverUsername ] } },
          $push: { interactions: { question, answer } }
        }
      );
  } else {
    await collection.insertOne({
      userId,
      permenant_username: [ uniqueUsername ],
      server_nicknames: [ serverUsername ],
      chat_history: [{ question, answer }],
      stored_information: []
    });
  }
}

// Storing user information
async function storeUser(userId, information) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  if (userMemory) {
    await collection.updateOne(
      { userId },
      { 
        $push: { stored_information: information }
      }
    );
  } else {
    await collection.insertOne({
      userId,
      permanent_username: [],
      server_nicknames: [],
      chat_history: [],
      stored_information: [information]
    });
  }
  const user = "**User: **" + await getPermenantUsername(userId) + "\n";
  return "Operation Successful!\n\n" + user + "**Stored: **" + information;
}

// Storing global information
async function storeGlobal(information) {
  const db = await connectToMongoDB();
  const collection = db.collection('global_memory');

  const globalMemory = await collection.findOne({});

  if (globalMemory) {
    await collection.updateOne(
      {},
      { 
        $push: { stored_information: information }
      }
    );
  } else {
    await collection.insertOne({
      stored_information: [information],
    });
  }
  return "Operation Successful!\n\n**Stored: **" + information;
}

// Accessing user stored information
async function viewUser(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  let storedInformation;
  if (userMemory) {
    const user = await getPermenantUsername(userId);
    storedInformation = userMemory.stored_information;
    storedInformation.unshift("**User: " + user + "**");
  }
  return userMemory ? storedInformation : "No information stored for this user!";
}

// Accessing global stored information
async function viewGlobal() {
  const db = await connectToMongoDB();
  const collection = db.collection('global_memory');

  const globalMemory = await collection.findOne({});
  let storedInformation;
  if (globalMemory) {
    storedInformation = globalMemory.stored_information;
    storedInformation.unshift("**Stored Global Information: **");
  }
  return globalMemory ? storedInformation : "No global information stored!";
}

// Deleting user stored information
async function deleteUser(userId, index) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  if (userMemory && userMemory.stored_information.length > index && index >= 0) {
    const itemToDelete = userMemory.stored_information[index];
    const user = await getPermenantUsername(userId);

    await collection.updateOne(
      { userId },
      {
        $pull: { stored_information: { $eq: itemToDelete } }
      }
    );
    return "Operation Successful!\n\n**User: **" + user + "\n**Information Deleted: **" + itemToDelete;
  } else {
    if (!userMemory) {
      return "This user's memory doesn't exist!";
    } else {
      return "Invalid index!  Deletion operation failed.";
    }
  }
}

// Deleting global stored information
async function deleteGlobal(index) {
  const db = await connectToMongoDB();
  const collection = db.collection('global_memory');

  const globalMemory = await collection.findOne({});
  if (globalMemory && globalMemory.stored_information.length > index && index >= 0) {
    const itemToDelete = globalMemory.stored_information[index];

    await collection.updateOne(
      {},
      {
        $pull: { stored_information: { $eq: itemToDelete } }
      }
    );
    return "Operation Successful!\n\n**Information Deleted: **" + itemToDelete;
  } else {
    if (!globalMemory) {
      return "Global memory doesn't exist!";
    } else {
      return "Invalid index!  Deletion operation failed.";
    }
  }
}

/** Getters */

// Getting chat history
async function getUserMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.chat_history : [];
}

// Getting user nickname list
async function getUserNickname(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.server_nicknames : [];
}

// Getting user's permenant username
async function getPermenantUsername(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  let username;
  if (userMemory && userMemory.permenant_username != null) {
    username = userMemory.permenant_username;
  } else {
    username = userId;
  }
  return username;
}

export { storeInteraction, storeUser, storeGlobal, viewUser, viewGlobal, 
  deleteUser, deleteGlobal, getUserNickname, getUserMemory };
