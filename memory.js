import { connectToMongoDB } from './db.js';

async function storeInteraction(userId, question, answer) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  // Checking if user exists
  const userMemory = await collection.findOne({ userId });

  if (userMemory) {
    await collection.updateOne(
      { userId },
      { $push: { interactions: { question, answer } } }
    );
  } else {
    // Creating user
    await collection.insertOne({
      userId,
      interactions: [{ question, answer }],
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
