const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const validation = require("../middleware/validationMiddleware");
const auth = require("../middleware/authenticate");

// GET all staff (with optional filters)
router.get("/", staffController.getAll);

// GET single staff by ID
router.get("/:id", staffController.getSingle);

// POST to create new staff - moved from root route
router.post(
  "/",
  auth.isAuthenticated,
  validation.saveStaff,
  staffController.createStaff
);

// PUT to update staff by ID
router.put(
  "/:id",
  auth.isAuthenticated,
  validation.saveStaff,
  staffController.updateStaff
);

// DELETE staff by ID
router.delete("/:id", auth.isAuthenticated, staffController.deleteStaff);

module.exports = router;
