const { object } = require("webidl-conversions");
const mongodb = require("../config/db");
const ObjectId = require("mongodb").ObjectId;

const getAll = async (req, res) => {
  //#swagger.tags = ['users']

  try {
    const db = mongodb.getDb();
    const lists = await db.collection("users").find().toArray();

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(lists);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getsingle = async (req, res) => {
  //#swagger.tags = ['users']

  // Check if the car ID is valid
  if (!ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ message: "Must use a valid user Id to retrieve users" });
  }

  try {
    // Convert the car ID to an ObjectId
    const userId = new ObjectId(req.params.id);
    const db = mongodb.getDb();

    // Try to find the user in the database
    const result = await db.collection("users").find({ _id: userId }).toArray();

    if (result.length > 0) {
      // If a user is found, send the result
      return res.status(200).json(result[0]);
    } else {
      // If no user is found, send a 404 error
      return res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    // Handle errors gracefully, ensuring no duplicate responses are sent
    if (!res.headersSent) {
      return res.status(400).json({ message: err.message });
    }
  }
};

const createUser = async (req, res) => {
  //#swagger.tags = ['users']
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    gender: req.body.gender,
    ip_address: req.body.ip_address,
  };
  const response = await mongodb
    .getDb()
    .collection("users")
    .insertOne(user);
  if (response.acknowledged) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(response.error || "some error occured while creating the user.");
  }
};

const updateUser = async (req, res) => {
  //#swagger.tags = ['users']
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json("Must use a valid Id to update user");
  }

  const userId = new ObjectId(req.params.id);
  const user = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    gender: req.body.gender,
    ip_address: req.body.ip_address,
  };
  const response = await mongodb
    .getDb()
    .collection("users")
    .replaceOne({ _id: userId }, user);
  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(response.error || "some error occured while updating the user.");
  }
};

const deleteUser = async (req, res) => {
  //#swagger.tags = ['users']
  try {
    const userId = req.params.id;

    // Check if the provided ID is a valid ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Must use a valid user ID to delete a user",
      });
    }

    // Convert the ID to ObjectId
    const objectId = new ObjectId(userId);

    // Perform the delete operation
    const response = await mongodb
      .getDb()
      .collection("users")
      .deleteOne({ _id: objectId });

    if (response.deletedCount > 0) {
      return res.status(204).send(); // No content to return on successful delete
    } else {
      return res.status(404).json({
        message: "user not found, deletion failed.",
      });
    }
  } catch (err) {
    // Catch any errors that might occur
    console.error("Error during delete operation:", err);
    return res.status(500).json({
      message: err.message || "An error occurred while deleting the user.",
    });
  }
};

module.exports = { getAll, getsingle, createUser, updateUser, deleteUser };
