import { connectToMongoDB } from './db.js';

// Storing user chat history
export async function storeInteraction(userId, permenantUsername, serverNickname, question, answer) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');
  const userMemory = await collection.findOne({ userId });

  const updateFields = {
    $addToSet: { permenant_username: permenantUsername },
    $push: { chat_history: { question, answer } }
  };

  if (serverNickname) {
    updateFields.$addToSet.server_nicknames = serverNickname;
  }

  if (userMemory) {
    await collection.updateOne(
        { userId },
        updateFields
      );
  } else {
    await collection.insertOne({
      userId,
      permenant_username: [ permenantUsername ],
      server_nicknames: serverNickname ? [ serverNickname ] : [],
      chat_history: [{ question, answer }],
      logic_history: [],
      stored_information: []
    });
  }
}

// Storing user information using store command
export async function storeUser(userId, information) {
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
      logic_history: [],
      stored_information: [information]
    });
  }
  const user = "**User: **" + await getPermenantUsername(userId) + "\n";
  return "Operation Successful!\n\n" + user + "**Stored: **" + information;
}

// Storing global information using store command
export async function storeGlobal(information) {
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

// Accessing user stored information using viewstored command
export async function viewUser(userId) {
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

// Accessing global stored information using viewstored command
export async function viewGlobal(guild) {
  const db = await connectToMongoDB();
  const collection = db.collection('global_memory');

  const globalMemory = await collection.findOne({});
  let storedInformation;
  if (globalMemory) {
    storedInformation = globalMemory.stored_information;
    storedInformation.unshift("**Stored Global Information: **");
  }

  if (guild === '1293953828256878685' || guild === '636026902796173343' || guild === '645400406129639454') {
    return globalMemory ? storedInformation : "No global information stored!";
  } else {
    return "No global information stored!"
  }
}

// Deleting user stored information using deletestored command
export async function deleteUser(userId, index) {
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

// Deleting global stored information using deletestored command
export async function deleteGlobal(index) {
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

// Storing user's logic history (last 5 interactions)
export async function storeLogicInteraction(userId, permenantUsername, serverNickname, question, answer) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');
  const userMemory = await collection.findOne({ userId });

  const updateFields = {
    $addToSet: { permenant_username: permenantUsername },
    $push: { 
      logic_history: { 
        $each: [{ question, answer }] ,
        $slice: -5, // Only storing the last 5 entries
      },
    },
  };

  if (serverNickname) {
    updateFields.$addToSet.server_nicknames = serverNickname;
  }

  if (userMemory) {
    await collection.updateOne(
        { userId },
        updateFields
      );
  } else {
    await collection.insertOne({
      userId,
      permenant_username: [ permenantUsername ],
      server_nicknames: serverNickname ? [ serverNickname ] : [],
      chat_history: [],
      logic_history: [{ question, answer }],
      stored_information: []
    });
  }
}

/** Getters */

// Getting chat history
export async function getUserMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.chat_history : [];
}

// Getting logic history
export async function getLogicMemory(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.logic_history : [];
}

// Getting user nickname list
export async function getUserNickname(userId) {
  const db = await connectToMongoDB();
  const collection = db.collection('user_memory');

  const userMemory = await collection.findOne({ userId });
  return userMemory ? userMemory.server_nicknames : [];
}

// Getting user's permenant username
export async function getPermenantUsername(userId) {
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