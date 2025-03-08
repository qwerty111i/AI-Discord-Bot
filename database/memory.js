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
          $addToSet: { usernames: { $each: [ serverUsername ] } },
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

async function getUserMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.chat_history : [];
}

export { storeInteraction, getUserMemory };
