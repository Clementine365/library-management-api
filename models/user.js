// User model structure
// This model represents library members (not staff)

const userSchema = {
  // Core user information
  first_name: String, // First name of the user
  last_name: String, // Last name of the user
  email: String, // Email address (unique, used for login)
  phone: String, // Contact phone number
  address: {
    // Address information
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },

  // Authentication information
  password: String, // Hashed password (for local authentication)
  githubId: String, // GitHub ID (for OAuth authentication)
  auth_method: {
    // Primary authentication method
    type: String,
    enum: ["local", "github"],
    default: "local",
  },

  // User status and type
  user_type: {
    // Type of user
    type: String,
    enum: ["regular", "premium", "academic"],
    default: "regular",
  },
  status: {
    // Account status
    type: String,
    enum: ["active", "suspended", "blocked"],
    default: "active",
  },

  // Membership information
  library_card: String, // Library card number (auto-generated)
  membership_start: Date, // When membership started
  membership_end: Date, // When membership expires
  borrowing_limit: {
    // Maximum number of books allowed to borrow
    type: Number,
    default: 5,
  },

  // Security and verification
  email_verified: {
    // Whether email address is verified
    type: Boolean,
    default: false,
  },
  verification_token: String, // Token for email verification
  password_reset_token: String, // Token for password reset
  password_reset_expires: Date, // When password reset token expires

  // System fields
  last_login: Date, // Last time user logged in
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

module.exports = userSchema;
