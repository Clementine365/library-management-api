const { ObjectId } = require("mongodb");
const mongodb = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

// Helper function to get database connection
const getUserCollection = () => {
  return mongodb.getDb().db("team13_project").collection("users");
};

/**
 * Generate a unique library card number
 * Format: LIB-[YEAR]-[5-DIGIT SEQUENTIAL NUMBER]
 */
const generateLibraryCard = async () => {
  try {
    const collection = getUserCollection();
    const currentYear = new Date().getFullYear().toString().slice(-2); // Last two digits of year
    const prefix = `LIB${currentYear}`;

    // Find the highest existing library card for this year
    const latestUser = await collection
      .find({
        library_card: { $regex: new RegExp(`^${prefix}`) },
      })
      .sort({ library_card: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (latestUser.length > 0 && latestUser[0].library_card) {
      // Extract the number part of the last code and increment
      const lastCode = latestUser[0].library_card;
      const lastNumber = parseInt(lastCode.slice(-5), 10);
      nextNumber = lastNumber + 1;
    }

    // Pad number with leading zeros to ensure 5 digits
    return `${prefix}${nextNumber.toString().padStart(5, "0")}`;
  } catch (err) {
    console.error("Error generating library card:", err);
    // Fallback to timestamp if there's an error
    return `LIB${new Date().getFullYear().toString().slice(-2)}${Date.now()
      .toString()
      .slice(-5)}`;
  }
};

/**
 * Create JWT token for user authentication
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "default_jwt_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

/**
 * Register a new user with email and password
 */
const registerUser = async (req, res) => {
  try {
    const collection = getUserCollection();

    // Check if user with this email already exists
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error_code: "EMAIL_ALREADY_EXISTS",
        message: "A user with this email address already exists",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Generate a library card number
    const libraryCard = await generateLibraryCard();

    // Hash password if provided
    let hashedPassword = null;
    let authMethod = "github"; // Default to GitHub if no password

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(req.body.password, salt);
      authMethod = "local";
    }

    // Set membership dates
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    // Create user data
    const userData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address || {},
      password: hashedPassword,
      githubId: req.body.githubId || null,
      auth_method: authMethod,
      user_type: req.body.user_type || "regular",
      status: "active",
      library_card: libraryCard,
      membership_start: now,
      membership_end: oneYearLater,
      borrowing_limit: req.body.user_type === "premium" ? 10 : 5,
      email_verified: false,
      verification_token: verificationToken,
      created_at: now,
      updated_at: now,
    };

    // Insert into database
    const result = await collection.insertOne(userData);

    // Generate JWT token
    const token = generateToken(result.insertedId.toString());

    // Here you would normally send a verification email with the token
    // For now we'll just log it
    console.log(
      `Verification link would be sent to ${userData.email} with token ${verificationToken}`
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: result.insertedId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        library_card: userData.library_card,
        user_type: userData.user_type,
        email_verified: userData.email_verified,
      },
      token: token,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({
      success: false,
      error_code: "REGISTRATION_ERROR",
      message: "Failed to register user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Login with email and password
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const collection = getUserCollection();

    // Check if user exists
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error_code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // Check if the user is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error_code: "ACCOUNT_INACTIVE",
        message: `Your account is ${user.status}. Please contact support.`,
      });
    }

    // Check if user has a password (local auth enabled)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error_code: "WRONG_AUTH_METHOD",
        message:
          "This account uses GitHub authentication. Please log in with GitHub.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error_code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    // Update last login time
    await collection.updateOne(
      { _id: user._id },
      { $set: { last_login: new Date(), updated_at: new Date() } }
    );

    // Generate token
    const token = generateToken(user._id.toString());

    // Create session with user info
    if (req.session) {
      req.session.user = {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        isLibraryMember: true,
      };
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        library_card: user.library_card,
        user_type: user.user_type,
      },
      token: token,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({
      success: false,
      error_code: "LOGIN_ERROR",
      message: "Failed to log in",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Link GitHub account to user
 */
const linkGitHubToUser = async (req, res) => {
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
        message: "The provided user ID is not in a valid format",
      });
    }

    const userId = new ObjectId(req.params.id);
    const githubId = req.session.user.id;

    const collection = getUserCollection();

    // Check if user exists
    const existingUser = await collection.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error_code: "USER_NOT_FOUND",
        message: "User with the specified ID does not exist",
      });
    }

    // Check if GitHub ID is already linked to another user
    const existingLink = await collection.findOne({ githubId });
    if (existingLink && existingLink._id.toString() !== userId.toString()) {
      return res.status(409).json({
        success: false,
        error_code: "GITHUB_ALREADY_LINKED",
        message: "This GitHub account is already linked to another user",
      });
    }

    // Update user with GitHub ID
    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          githubId,
          auth_method: existingUser.password
            ? existingUser.auth_method
            : "github",
          updated_at: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "GitHub account linked to user successfully",
    });
  } catch (err) {
    console.error("Error linking GitHub account:", err);
    res.status(500).json({
      success: false,
      error_code: "GITHUB_LINK_ERROR",
      message: "Failed to link GitHub account to user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Verify user email with token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const collection = getUserCollection();

    // Find user with this verification token
    const user = await collection.findOne({ verification_token: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_TOKEN",
        message: "Invalid or expired verification token",
      });
    }

    // Update user to verified status
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          email_verified: true,
          verification_token: null,
          updated_at: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Error verifying email:", err);
    res.status(500).json({
      success: false,
      error_code: "VERIFICATION_ERROR",
      message: "Failed to verify email",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Forgot password - send reset token
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const collection = getUserCollection();

    // Find user with this email
    const user = await collection.findOne({ email });
    if (!user) {
      // For security reasons, still return success even if email doesn't exist
      return res.status(200).json({
        success: true,
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
    }

    // Check if user uses password authentication
    if (!user.password) {
      // For security reasons, don't disclose that this is a GitHub account
      return res.status(200).json({
        success: true,
        message:
          "If your email exists in our system, you will receive a password reset link",
      });
    }

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token expiry to 1 hour from now
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Update user with reset token
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password_reset_token: hashResetToken,
          password_reset_expires: resetExpires,
          updated_at: new Date(),
        },
      }
    );

    // Here you would normally send an email with the reset link
    // For now we'll just log it
    console.log(
      `Password reset link would be sent to ${user.email} with token ${resetToken}`
    );

    res.status(200).json({
      success: true,
      message:
        "If your email exists in our system, you will receive a password reset link",
    });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({
      success: false,
      error_code: "PASSWORD_RESET_REQUEST_ERROR",
      message: "Failed to process password reset request",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const collection = getUserCollection();

    // Hash the received token for comparison
    const hashResetToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with this reset token and valid expiry
    const user = await collection.findOne({
      password_reset_token: hashResetToken,
      password_reset_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_RESET_TOKEN",
        message: "Invalid or expired password reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with new password
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: new Date(),
          // If they were GitHub-only before, they now have a password too
          auth_method: user.githubId ? "local" : "local",
        },
      }
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset successful. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({
      success: false,
      error_code: "PASSWORD_RESET_ERROR",
      message: "Failed to reset password",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    const collection = getUserCollection();

    // Define projection to exclude sensitive information
    const projection = {
      password: 0,
      verification_token: 0,
      password_reset_token: 0,
      password_reset_expires: 0,
    };

    const users = await collection.find({}, { projection }).toArray();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      error_code: "USER_FETCH_ERROR",
      message: "Failed to retrieve users",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Get a specific user by ID
 */
const getUserById = async (req, res) => {
  try {
    // Validate ID format
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided user ID is not in a valid format",
      });
    }

    const userId = new ObjectId(req.params.id);
    const collection = getUserCollection();

    // Exclude sensitive information
    const projection = {
      password: 0,
      verification_token: 0,
      password_reset_token: 0,
      password_reset_expires: 0,
    };

    const user = await collection.findOne({ _id: userId }, { projection });

    if (!user) {
      return res.status(404).json({
        success: false,
        error_code: "USER_NOT_FOUND",
        message: "User with the specified ID does not exist",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      success: false,
      error_code: "USER_FETCH_DETAIL_ERROR",
      message: "Failed to retrieve user details",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Update a user
 */
const updateUser = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided user ID is not in a valid format",
      });
    }

    const userId = new ObjectId(req.params.id);
    const collection = getUserCollection();

    // Check if user exists
    const existingUser = await collection.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error_code: "USER_NOT_FOUND",
        message: "User with the specified ID does not exist",
      });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    // Prevent changing some fields
    delete updateData.password;
    delete updateData.email_verified;
    delete updateData.verification_token;
    delete updateData.password_reset_token;
    delete updateData.password_reset_expires;

    // Prevent changing the library_card
    if (
      updateData.library_card &&
      updateData.library_card !== existingUser.library_card
    ) {
      return res.status(400).json({
        success: false,
        error_code: "IMMUTABLE_FIELD",
        message: "Library card number cannot be modified",
      });
    }

    // If email is being changed, verify it's not already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await collection.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error_code: "EMAIL_ALREADY_EXISTS",
          message: "This email is already in use by another user",
        });
      }

      // If email is changed, set it as unverified and generate new token
      updateData.email_verified = false;
      updateData.verification_token = crypto.randomBytes(32).toString("hex");

      // Here you would send a verification email to the new address
      console.log(
        `Verification link would be sent to ${updateData.email} with token ${updateData.verification_token}`
      );
    }

    const result = await collection.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      error_code: "USER_UPDATE_ERROR",
      message: "Failed to update user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Delete a user (admin only)
 */
const deleteUser = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided user ID is not in a valid format",
      });
    }

    const userId = new ObjectId(req.params.id);
    const collection = getUserCollection();

    // Check if the user has any active loans or holds
    // This would involve checking the loans collection
    // Here we'd add code to check that

    const result = await collection.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error_code: "USER_NOT_FOUND",
        message: "User with the specified ID does not exist",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      success: false,
      error_code: "USER_DELETION_ERROR",
      message: "Failed to delete user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Change user password (requires current password)
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error_code: "INVALID_ID_FORMAT",
        message: "The provided user ID is not in a valid format",
      });
    }

    const userId = new ObjectId(req.params.id);
    const collection = getUserCollection();

    // Check if user exists and get current password
    const user = await collection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error_code: "USER_NOT_FOUND",
        message: "User not found",
      });
    }

    // If user doesn't have a password (GitHub-only), they need to set one up via forgot password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error_code: "NO_PASSWORD_SET",
        message:
          "You don't have a password set. Please use the 'forgot password' feature to create one.",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error_code: "INVALID_CURRENT_PASSWORD",
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update with new password
    await collection.updateOne(
      { _id: userId },
      {
        $set: {
          password: hashedPassword,
          auth_method: user.githubId ? "local" : "local", // Keep both auth methods if available
          updated_at: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({
      success: false,
      error_code: "PASSWORD_CHANGE_ERROR",
      message: "Failed to change password",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Logout user (clear session)
 */
const logoutUser = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error_code: "LOGOUT_ERROR",
          message: "Failed to logout",
          details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid");

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } else {
    res.status(200).json({
      success: true,
      message: "Already logged out",
    });
  }
};

// Database connection function
const getDb = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return {
    db: client.db(process.env.DB_NAME),
    client,
  };
};

// Send JWT token as response
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // Remove password from output
  user.password = undefined;

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    // Validate input
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Check if user with email already exists
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      await client.close();
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    newUser._id = result.insertedId;

    await client.close();

    // Generate JWT and send response
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Find user
    const user = await db.collection("users").findOne({ email });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await client.close();
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    // Check if user is active
    if (!user.active) {
      await client.close();
      return res.status(401).json({
        status: "fail",
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    await client.close();

    // Generate JWT and send response
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while logging in",
      error: error.message,
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide your email",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Find user
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      await client.close();
      return res.status(404).json({
        status: "fail",
        message: "No user found with that email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken,
          passwordResetExpires,
          updatedAt: new Date(),
        },
      }
    );

    await client.close();

    // TODO: Send email with reset token
    // For now, just return the token in the response (not secure for production)

    res.status(200).json({
      status: "success",
      message: "Password reset token sent to email",
      resetToken, // This should be removed in production
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing your request",
      error: error.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide password and password confirmation",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Hash the token received from params
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Connect to DB
    const { db, client } = await getDb();

    // Find user with token and check if token is expired
    const user = await db.collection("users").findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      await client.close();
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with new password and remove reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
          passwordChangedAt: new Date(),
        },
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      }
    );

    await client.close();

    // Log the user in
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while resetting your password",
      error: error.message,
    });
  }
};

// Update password for logged in user
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "New passwords do not match",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Find user with fresh data to check password
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user._id) });

    // Check if current password is correct
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      await client.close();
      return res.status(401).json({
        status: "fail",
        message: "Your current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user with new password
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    await client.close();

    // Log the user in with new password
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating your password",
      error: error.message,
    });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    // Connect to DB
    const { db, client } = await getDb();

    // Find user by ID
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { password: 0 } } // Exclude password
    );

    await client.close();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving your profile",
      error: error.message,
    });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  try {
    // Filter out fields that are not allowed to be updated
    const { password, passwordConfirm, role, ...updateData } = req.body;

    if (password || passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message:
          "This route is not for password updates. Please use /updatePassword.",
      });
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // Connect to DB
    const { db, client } = await getDb();

    // Update user
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user._id) }, { $set: updateData });

    // Fetch updated user
    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { password: 0 } } // Exclude password
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating your profile",
      error: error.message,
    });
  }
};

// Delete (deactivate) current user
exports.deleteMe = async (req, res) => {
  try {
    // Connect to DB
    const { db, client } = await getDb();

    // Deactivate user instead of deleting
    await db.collection("users").updateOne(
      { _id: new ObjectId(req.user._id) },
      {
        $set: {
          active: false,
          updatedAt: new Date(),
        },
      }
    );

    await client.close();

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while deactivating your account",
      error: error.message,
    });
  }
};

// ADMIN ONLY ROUTES

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Connect to DB
    const { db, client } = await getDb();

    // Get all users, excluding passwords
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();

    await client.close();

    res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};

// Get user by ID
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Find user by ID
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } } // Exclude password
    );

    await client.close();

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving the user",
      error: error.message,
    });
  }
};

// Create new user (admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, role } = req.body;

    // Validate input
    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required fields",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Check if user with email already exists
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      await client.close();
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);
    newUser._id = result.insertedId;

    // Remove password from response
    delete newUser.password;

    await client.close();

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the user",
      error: error.message,
    });
  }
};

// Update user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }

    // Filter out password fields (use separate route for that)
    const { password, passwordConfirm, ...updateData } = req.body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // Connect to DB
    const { db, client } = await getDb();

    // Update user
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    // Fetch updated user
    const updatedUser = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } } // Exclude password
    );

    await client.close();

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the user",
      error: error.message,
    });
  }
};

// Delete user (admin) - hard delete
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid user ID",
      });
    }

    // Connect to DB
    const { db, client } = await getDb();

    // Delete user
    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(id) });

    await client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while deleting the user",
      error: error.message,
    });
  }
};

// GitHub OAuth integration placeholder
exports.githubAuth = async (req, res) => {
  try {
    // Implementation for GitHub OAuth will go here
    res.status(501).json({
      status: "fail",
      message: "GitHub authentication not yet implemented",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred during GitHub authentication",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  linkGitHubToUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  logoutUser,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  githubAuth,
};
