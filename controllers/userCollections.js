const mongodb = require("../config/db");
const ObjectId = require("mongodb").ObjectId;

const createUser = async (profile) => {
  try {
    const db = mongodb.getDb();
    const usersCollection = db.collection("login_records_github");

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
    const error = new Error(`Error in creating/updating user: ${err.message}`);
    error.statusCode = 500;
    throw error;
  }
};

const getUserByGitHubId = async (githubId) => {
  try {
    const db = mongodb.getDb();
    const usersCollection = db.collection("login_records_github");

    const user = await usersCollection.findOne({ githubId });

    if (!user) {
      const error = new Error(`User with GitHub ID ${githubId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    return user;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = `Error finding user: ${err.message}`;
    }
    throw err;
  }
};

module.exports = { createUser, getUserByGitHubId };
