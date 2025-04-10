const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

const collection = () => getDb().collection("staff");

// Create a new staff member
exports.createStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    is_admin,
    status,
  } = req.body;

  try {
    const result = await collection().insertOne({
      first_name,
      last_name,
      email,
      phone,
      position,
      department,
      hire_date,
      salary,
      is_admin,
      status,
    });
    res.status(201).json(
      result.ops
        ? result.ops[0]
        : {
            _id: result.insertedId,
            first_name,
            last_name,
            email,
            phone,
            position,
            department,
            hire_date,
            salary,
            is_admin,
            status,
          }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all staff members with optional filters
exports.getStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  const { first_name, last_name, position, department, status } = req.query;

  try {
    const query = {};
    if (first_name) query.first_name = { $regex: first_name, $options: "i" };
    if (last_name) query.last_name = { $regex: last_name, $options: "i" };
    if (position) query.position = { $regex: position, $options: "i" };
    if (department) query.department = { $regex: department, $options: "i" };
    if (status) query.status = status;

    const staff = await collection().find(query).toArray();
    res.json(staff);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get a staff member by ID
exports.getStaffById = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const staffMember = await collection().findOne({
      _id: new ObjectId(req.params.staffId),
    });
    if (!staffMember)
      return res.status(404).json({ msg: "Staff member not found" });
    res.json(staffMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update a staff member
exports.updateStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  const {
    first_name,
    last_name,
    email,
    phone,
    position,
    department,
    hire_date,
    salary,
    is_admin,
    status,
  } = req.body;

  try {
    const result = await collection().findOneAndUpdate(
      { _id: new ObjectId(req.params.staffId) },
      {
        $set: {
          first_name,
          last_name,
          email,
          phone,
          position,
          department,
          hire_date,
          salary,
          is_admin,
          status,
        },
      },
      { returnDocument: "after" }
    );

    if (!result.value)
      return res.status(404).json({ msg: "Staff member not found" });

    res.json(result.value);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
  //#swagger.tags=['Staff']
  try {
    const result = await collection().deleteOne({
      _id: new ObjectId(req.params.staffId),
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ msg: "Staff member not found" });

    res.json({ msg: "Staff member deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
