// Staff model structure
// This model represents the structure of staff data in the database

const staffSchema = {
  // staff_id is removed as we'll use MongoDB's _id
  first_name: String, // First name of staff member
  last_name: String, // Last name of staff member
  email: String, // Email address (unique)
  phone: String, // Contact phone number
  position: String, // Staff position/role (e.g., Librarian, Manager)
  department: String, // Department they work in
  hire_date: Date, // Date when staff was hired
  salary: Number, // Staff salary
  is_admin: Boolean, // Whether the staff has admin privileges
  githubId: String, // GitHub ID for OAuth authentication
  employeeCode: String, // A human-readable employee code for reference
  status: {
    // Active, On Leave, Terminated
    type: String,
    enum: ["Active", "On Leave", "Terminated"],
    default: "Active",
  },
  created_at: {
    // Record creation timestamp
    type: Date,
    default: Date.now,
  },
  updated_at: {
    // Record update timestamp
    type: Date,
    default: Date.now,
  },
};

module.exports = staffSchema;
