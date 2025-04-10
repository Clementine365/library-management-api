const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { MongoClient, ObjectId } = require("mongodb");

// Database connection function
const getDb = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  return {
    db: client.db(process.env.DB_NAME),
    client,
  };
};

// Protect routes - check if user is logged in
exports.protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const { db, client } = await getDb();
    const currentUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!client.close) {
      client.close();
    }

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      });
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );

      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          status: "fail",
          message: "User recently changed password. Please log in again.",
        });
      }
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication failed",
      error: error.message,
    });
  }
};

// Restrict certain routes to specific user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

// Check if the user is the owner of the resource or an admin
exports.isOwner = (req, res, next) => {
  try {
    const userId = req.params.id || req.params.userId;
    const currentUserId = req.user._id.toString();

    if (currentUserId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Set user ID from params to req.params.id for the current user
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

// Check if a user is logged in (for non-protected routes that need user info)
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // Check if user still exists
      const { db, client } = await getDb();
      const currentUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) });

      client.close();

      if (!currentUser) {
        return next();
      }

      // Check if user changed password after token was issued
      if (currentUser.passwordChangedAt) {
        const changedTimestamp = parseInt(
          currentUser.passwordChangedAt.getTime() / 1000,
          10
        );

        if (decoded.iat < changedTimestamp) {
          return next();
        }
      }

      // There is a logged-in user
      req.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    next();
  }
};
