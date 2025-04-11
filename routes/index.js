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

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
