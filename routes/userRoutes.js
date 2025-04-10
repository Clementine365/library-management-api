const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.post("/forgotPassword", userController.forgotPassword);
router.put("/resetPassword/:token", userController.resetPassword);
router.get("/github", userController.githubAuth); // GitHub OAuth route

// Protected routes - require authentication
router.use(authMiddleware.protect); // All routes below this middleware will require authentication

// User profile routes
router.get("/me", authMiddleware.getMe, userController.getMe);
router.put("/updateMe", userController.updateMe);
router.put("/updatePassword", userController.updatePassword);
router.delete("/deleteMe", userController.deleteMe);

// Admin routes - restrict to admin only
router.use(authMiddleware.restrictTo("admin")); // All routes below this middleware will require admin role

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// GitHub authentication linking
router.post("/:id/github-link", userController.linkGitHubToUser);

module.exports = router;
