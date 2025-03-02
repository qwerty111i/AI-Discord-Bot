import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;
let db;

async function connectToMongoDB() {
  if (client && db) return db;

  try {
    client = new MongoClient(process.env.MONGO_URI); 
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB");

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw new Error("MongoDB connection failed");
  }
}

export { connectToMongoDB };
