import { connectToMongoDB } from './db.js';

async function storeInteraction(userId, serverUsername, uniqueUsername, question, answer) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });

  if (userMemory) {
    if (!userMemory.usernames.includes(serverUsername)) {
      if (!userMemory.usernames.includes(uniqueUsername)) {
        await collection.updateOne(
          { userId },
          { 
            $push: { usernames: serverUsername, uniqueUsername },
            $push: { interactions: { question, answer } }
          }
        );
      } else {
        await collection.updateOne(
          { userId },
          { 
            $push: { usernames: serverUsername, uniqueUsername },
            $push: { interactions: { question, answer } }
          }
        );
      }
    } else {
      await collection.updateOne(
        { userId },
        { $push: { interactions: { question, answer } } }
      );
    }
  } else {
    // If the user doesn't exist in the database
    await collection.insertOne({
      userId,
      usernames: [serverUsername, uniqueUsername],
      interactions: [{ question, answer }]
    });
  }
}

async function getUserMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.interactions : [];
}

export { storeInteraction, getUserMemory };
