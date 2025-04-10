const mongodb = require("../config/db");
const ObjectId = require("mongodb").ObjectId;

/**
 * Checks for valid authentication information from various auth methods
 * Currently supports:
 * - Session-based auth with GitHub
 * - API key auth (future)
 */
const getAuthenticatedUser = async (req) => {
  // Check session authentication first
  if (req.session && req.session.user && req.session.user.id) {
    return {
      type: "github",
      id: req.session.user.id,
    };
  }

  // Check for API key authentication (if available)
  const apiKey = req.headers["x-api-key"] || req.query.api_key;
  if (apiKey) {
    try {
      // Here we'd validate the API key against a database
      // This is just a placeholder for future implementation
      const db = mongodb.getDb().db("team13_project");
      const apiKeyDoc = await db
        .collection("api_keys")
        .findOne({ key: apiKey, active: true });

      if (apiKeyDoc && apiKeyDoc.staff_id) {
        return {
          type: "api_key",
          id: apiKeyDoc.staff_id,
        };
      }
    } catch (err) {
      console.error("API key validation error:", err);
    }
  }

  // Authentication failed
  return null;
};

/**
 * Middleware to check if the user is authenticated and is a staff member
 */
const isStaff = async (req, res, next) => {
  try {
    // Get authentication information
    const authInfo = await getAuthenticatedUser(req);

    if (!authInfo) {
      return res.status(401).json({
        success: false,
        error_code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required to access this resource",
      });
    }

    // Find staff member based on auth method
    const db = mongodb.getDb().db("team13_project");
    let staffMember;

    if (authInfo.type === "github") {
      // GitHub authentication
      staffMember = await db.collection("staff").findOne({
        githubId: authInfo.id,
      });
    } else if (authInfo.type === "api_key") {
      // API key authentication - direct staff ID
      staffMember = await db.collection("staff").findOne({
        _id: new ObjectId(authInfo.id),
      });
    }

    if (!staffMember) {
      return res.status(403).json({
        success: false,
        error_code: "STAFF_ACCESS_DENIED",
        message: "Access denied. Not authorized as staff member.",
      });
    }

    // If staff status is not Active, deny access
    if (staffMember.status !== "Active") {
      return res.status(403).json({
        success: false,
        error_code: "STAFF_INACTIVE",
        message: `Access denied. Staff member status is ${staffMember.status}.`,
      });
    }

    // If staff is found, add staff info to request for use in controllers
    req.staffInfo = staffMember;
    next();
  } catch (err) {
    console.error("Staff authentication error:", err);
    res.status(500).json({
      success: false,
      error_code: "AUTH_SYSTEM_ERROR",
      message: "Authentication system error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Middleware to check if the authenticated staff member has admin privileges
 * Must be used after the isStaff middleware
 */
const isAdmin = (req, res, next) => {
  // staffInfo should be available from isStaff middleware
  if (!req.staffInfo) {
    return res.status(401).json({
      success: false,
      error_code: "STAFF_AUTH_REQUIRED",
      message: "Staff authentication is required first",
    });
  }

  if (!req.staffInfo.is_admin) {
    return res.status(403).json({
      success: false,
      error_code: "ADMIN_REQUIRED",
      message: "Access denied. Admin privileges required for this operation.",
    });
  }

  next();
};

/**
 * Middleware to check if a staff member can only edit their own information
 * unless they are an admin
 */
const canModifyStaff = (req, res, next) => {
  // staffInfo should be available from isStaff middleware
  if (!req.staffInfo) {
    return res.status(401).json({
      success: false,
      error_code: "STAFF_AUTH_REQUIRED",
      message: "Staff authentication is required",
    });
  }

  // Allow admin to modify any staff
  if (req.staffInfo.is_admin) {
    return next();
  }

  // Regular staff can only modify their own record
  const requestedStaffId = req.params.id;
  if (
    !requestedStaffId ||
    !ObjectId.isValid(requestedStaffId) ||
    requestedStaffId !== req.staffInfo._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      error_code: "MODIFY_OWN_ONLY",
      message: "Access denied. You can only modify your own information.",
    });
  }

  next();
};

module.exports = {
  isStaff,
  isAdmin,
  canModifyStaff,
};
