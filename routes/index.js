const passport = require("passport");
const router = require("express").Router();
const booksRoutes = require("./books");
const staffRoutes = require("./staff");

// Router for users

// Router for staff
router.use("/staff", staffRoutes);

// Router for books

// Router for lending records
router.use("/", require("./swagger"));

router.use("/books", booksRoutes);
router.use("/users", require("./users"));

router.get("/login", passport.authenticate("github"), (req, res) => {});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
