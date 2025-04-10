const { ObjectId } = require("mongodb");
const mongodb = require("../config/db");

// Helper function to get database connection
const getStaffCollection = () => {
  return mongodb.getDb().db("team13_project").collection("staff");
};

/**
 * Generate a unique employee code
 * Format: LIB-[YEAR]-[SEQUENTIAL NUMBER]
 */
const generateEmployeeCode = async () => {
  try {
    const collection = getStaffCollection();
    const currentYear = new Date().getFullYear();
    const prefix = `LIB-${currentYear}-`;

    // Find the highest existing employee code for this year
    const latestStaff = await collection
      .find({
        employeeCode: { $regex: new RegExp(`^${prefix}`) },
      })
      .sort({ employeeCode: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (latestStaff.length > 0 && latestStaff[0].employeeCode) {
      // Extract the number part of the last code and increment
      const lastCode = latestStaff[0].employeeCode;
      const lastNumber = parseInt(lastCode.split("-")[2], 10);
      nextNumber = lastNumber + 1;
    }

    // Pad number with leading zeros to ensure 4 digits
    return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
  } catch (err) {
    console.error("Error generating employee code:", err);
    // Fallback to timestamp if there's an error
    return `LIB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  }
};

/**
 * Get all staff members
 * Admin can see all, regular staff can only see basic info
 */
const getAllStaff = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to get all staff members'

  try {
    const collection = getStaffCollection();
    let staffMembers;

    // If admin, get all fields
    if (req.staffInfo && req.staffInfo.is_admin) {
      staffMembers = await collection.find({}).toArray();
    } else {
      // For regular staff, get only public fields
      staffMembers = await collection
        .find(
          {},
          {
            projection: {
              first_name: 1,
              last_name: 1,
              position: 1,
              department: 1,
              email: 1,
              employeeCode: 1,
              status: 1,
            },
          }
        )
        .toArray();
    }

    res.status(200).json({
      success: true,
      count: staffMembers.length,
      data: staffMembers,
    });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).json({
      success: false,
      error_code: "STAFF_FETCH_ERROR",
      message: "Failed to retrieve staff members",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get a specific staff member by ID
 */
const getStaffById = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to get a specific staff member by ID'

  try {
    // Validate ID format
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided staff ID is not in a valid format",
      });
    }

    const staffId = new ObjectId(req.params.id);
    const collection = getStaffCollection();

    // Define projection based on requesting user's role
    let projection = {};
    if (
      !(req.staffInfo && req.staffInfo.is_admin) &&
      req.staffInfo._id.toString() !== req.params.id
    ) {
      // Non-admin viewing someone else's record gets limited view
      projection = {
        first_name: 1,
        last_name: 1,
        position: 1,
        department: 1,
        email: 1,
        employeeCode: 1,
        status: 1,
      };
    }

    const staffMember = await collection.findOne(
      { _id: staffId },
      { projection }
    );

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        error_code: "STAFF_NOT_FOUND",
        message: "Staff member with the specified ID does not exist",
      });
    }

    res.status(200).json({
      success: true,
      data: staffMember,
    });
  } catch (err) {
    console.error("Error fetching staff member:", err);
    res.status(500).json({
      success: false,
      error_code: "STAFF_FETCH_DETAIL_ERROR",
      message: "Failed to retrieve staff member details",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Create a new staff member (admin only)
 */
const createStaff = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to create a new staff member'

  try {
    // Generate an employee code
    const employeeCode = await generateEmployeeCode();

    const staffData = {
      ...req.body,
      employeeCode,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const collection = getStaffCollection();

    // Check if email already exists
    const existingStaff = await collection.findOne({ email: staffData.email });
    if (existingStaff) {
      return res.status(409).json({
        success: false,
        error_code: "EMAIL_ALREADY_EXISTS",
        message: "A staff member with this email address already exists",
      });
    }

    const result = await collection.insertOne(staffData);
    if (!result.acknowledged) {
      throw new Error("Database operation failed: Insert not acknowledged");
    }

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: {
        _id: result.insertedId,
        ...staffData,
      },
    });
  } catch (err) {
    console.error("Error creating staff member:", err);
    res.status(500).json({
      success: false,
      error_code: "STAFF_CREATION_ERROR",
      message: "Failed to create staff member",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Update a staff member
 */
const updateStaff = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to update a staff member'

  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided staff ID is not in a valid format",
      });
    }

    const staffId = new ObjectId(req.params.id);
    const collection = getStaffCollection();

    // Check if staff exists
    const existingStaff = await collection.findOne({ _id: staffId });
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error_code: "STAFF_NOT_FOUND",
        message: "Staff member with the specified ID does not exist",
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    // Prevent changing the employeeCode
    if (
      updateData.employeeCode &&
      updateData.employeeCode !== existingStaff.employeeCode
    ) {
      return res.status(400).json({
        success: false,
        error_code: "IMMUTABLE_FIELD",
        message: "Employee code cannot be modified after creation",
      });
    }

    // If email is being changed, verify it's not already taken
    if (updateData.email && updateData.email !== existingStaff.email) {
      const emailExists = await collection.findOne({
        email: updateData.email,
        _id: { $ne: staffId },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error_code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already in use by another staff member",
        });
      }
    }

    const result = await collection.updateOne(
      { _id: staffId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error_code: "STAFF_NOT_FOUND",
        message: "Staff member with the specified ID does not exist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error updating staff member:", err);
    res.status(500).json({
      success: false,
      error_code: "STAFF_UPDATE_ERROR",
      message: "Failed to update staff member",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Delete a staff member (admin only)
 */
const deleteStaff = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to delete a staff member'

  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided staff ID is not in a valid format",
      });
    }

    const staffId = new ObjectId(req.params.id);
    const collection = getStaffCollection();

    const result = await collection.deleteOne({ _id: staffId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error_code: "STAFF_NOT_FOUND",
        message: "Staff member with the specified ID does not exist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting staff member:", err);
    res.status(500).json({
      success: false,
      error_code: "STAFF_DELETION_ERROR",
      message: "Failed to delete staff member",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Associate GitHub user with staff member
 */
const linkGitHubToStaff = async (req, res) => {
  // #swagger.tags = ['staff']
  // #swagger.description = 'Endpoint to link a GitHub account to a staff member'

  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({
        success: false,
        error_code: "GITHUB_AUTH_REQUIRED",
        message: "You must be logged in with GitHub to link accounts",
      });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided staff ID is not in a valid format",
      });
    }

    const staffId = new ObjectId(req.params.id);
    const githubId = req.session.user.id;

    const collection = getStaffCollection();

    // Check if staff exists
    const existingStaff = await collection.findOne({ _id: staffId });
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        error_code: "STAFF_NOT_FOUND",
        message: "Staff member with the specified ID does not exist",
      });
    }

    // Check if GitHub ID is already linked to another staff
    const existingLink = await collection.findOne({ githubId });
    if (existingLink && existingLink._id.toString() !== staffId.toString()) {
      return res.status(409).json({
        success: false,
        error_code: "GITHUB_ALREADY_LINKED",
        message:
          "This GitHub account is already linked to another staff member",
      });
    }

    // Update staff with GitHub ID
    const result = await collection.updateOne(
      { _id: staffId },
      {
        $set: {
          githubId,
          updated_at: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "GitHub account linked to staff member successfully",
    });
  } catch (err) {
    console.error("Error linking GitHub account:", err);
    res.status(500).json({
      success: false,
      error_code: "GITHUB_LINK_ERROR",
      message: "Failed to link GitHub account to staff member",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  linkGitHubToStaff,
};
