const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

const collection = () => getDb().collection("staff");

// Get all staff members
exports.getAll = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const result = await collection().find();
    const staff = await result.toArray();

    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching staff members",
      error: err.message,
    });
  }
};

// Get a single staff member by ID
exports.getSingle = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const staffId = new ObjectId(req.params.id);
    const result = await collection().find({ _id: staffId });

    const staffMembers = await result.toArray();
    if (!staffMembers.length) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json(staffMembers[0]);
  } catch (err) {
    res.status(400).json({
      message: "Invalid staff ID or fetch error",
      error: err.message,
    });
  }
};

// Create a new staff member
exports.createStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const staff = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      department: req.body.department,
      hire_date: req.body.hire_date,
      salary: req.body.salary,
      is_admin: req.body.is_admin,
      status: req.body.status,
    };

    const response = await collection().insertOne(staff);

    if (response.acknowledged) {
      return res.status(201).json({ id: response.insertedId });
    } else {
      return res.status(500).json({ message: "Failed to create staff member" });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error creating staff member",
      error: err.message,
    });
  }
};

// Update a staff member
exports.updateStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const staffId = new ObjectId(req.params.id);
    const staff = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      department: req.body.department,
      hire_date: req.body.hire_date,
      salary: req.body.salary,
      is_admin: req.body.is_admin,
      status: req.body.status,
    };

    const response = await collection().replaceOne({ _id: staffId }, staff);

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    if (response.modifiedCount > 0) {
      return res.status(204).send();
    } else {
      return res
        .status(200)
        .json({ message: "No changes made to the staff member" });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error updating staff member",
      error: err.message,
    });
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const staffId = new ObjectId(req.params.id);
    const response = await collection().deleteOne({ _id: staffId });

    if (response.deletedCount > 0) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: "Staff member not found" });
    }
  } catch (err) {
    res.status(400).json({
      message: "Error deleting staff member",
      error: err.message,
    });
  }
};
