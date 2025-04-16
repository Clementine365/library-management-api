const passport = require("passport");
const router = require("express").Router();

router.use("/", require("./swagger"));

router.use("/books", require("./books"));
router.use("/users", require("./users"));
router.use("/lending-records", require("./lending-records"));
router.use("/staff", require("./staff"));

router.get("/login", passport.authenticate("github"), (req, res) => {});

// Add a test login route for easier testing
router.get("/test-login", (req, res) => {
  req.session.user = {
    id: "test-user-id",
    username: "testuser",
    displayName: "Test User",
  };
  res.json({
    success: true,
    message: "You are now logged in with a test account",
    user: req.session.user,
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Could not log out",
          error: err.message
        });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      return res.status(200).json({
        success: true,
        message: "Successfully logged out"
      });
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "No active session to logout"
    });
  }
});

module.exports = router;
