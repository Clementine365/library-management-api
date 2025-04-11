const passport = require("passport");
const router = require("express").Router();

router.use("/books", require("./books"));
router.use("/users", require("./users"));
router.use("/lending-records", require("./lending-records"));
router.use("/staff", require("./staff"));

router.get("login", passport.authenticate("github"), (req, res) => {});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
