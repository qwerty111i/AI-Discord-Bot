import { connectToMongoDB } from './db.js';

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
    // If the user doesn't exist in the database
    await collection.insertOne({
      userId,
      permenant_username: [ uniqueUsername ],
      server_nicknames: [ serverUsername ],
      chat_history: [{ question, answer }],
      stored_information: []
    });
  }
}

async function storeInformation(userId, information) {
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
}

async function getStoredInformation(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.stored_information : [];
}

async function deleteStoredInformation(userId, index) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });

  if (userMemory && userMemory.stored_information.length > index) {
    const itemToDelete = userMemory.stored_information[index];

    // Perform the update to remove the element by matching its value
    await collection.updateOne(
      { userId },
      {
        $pull: { stored_information: { $eq: itemToDelete } }
      }
    );
    return itemToDelete;
  } else {
    return "Deletion operation failed!";
  }
}

async function getUserMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.chat_history : [];
}

async function getUserNickname(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.server_nicknames : [];
}

export { storeInteraction, storeInformation, getStoredInformation, deleteStoredInformation, getUserNickname, getUserMemory };
