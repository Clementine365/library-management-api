const mongodb = require("../config/db");
const ObjectId = require("mongodb").ObjectId;

const createUser = async (profile) => {
  try {
    const db = mongodb.getDb(); // Changed from getDatabase() to getDb()
    const usersCollection = db.collection("login_records_github"); // Assuming 'users' collection

    // Insert or update the user (upsert: true)
    const result = await usersCollection.updateOne(
      { githubId: profile.id },
      {
        $set: {
          githubId: profile.id,
          username: profile.username,
          photoUrl: profile.photos[0]?.value,
          profileUrl: profile.profileUrl,
        },
      },
      { upsert: true }
    );
    return result;
  } catch (err) {
    throw new Error(`Error in creating/updating user: ${err.message}`);
  }
};

const getUserByGitHubId = async (githubId) => {
  try {
    const db = mongodb.getDb(); // Changed from getDatabase() to getDb()
    const usersCollection = db.collection("login_records_github");

    const user = await usersCollection.findOne({ githubId });
    return user;
  } catch (err) {
    throw new Error(`Error finding user: ${err.message}`);
  }
};

module.exports = { createUser, getUserByGitHubId };
