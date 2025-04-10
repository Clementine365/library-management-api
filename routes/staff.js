const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const validation = require("../middleware/validation_Middleware");
const auth = require("../middleware/authenticate");

router.post(
  "/",
  auth.isAuthenticated,
  validation.saveStaff,
  staffController.createStaff
);
router.get("/", staffController.getStaff);
router.get("/:staffId", staffController.getStaffById);
router.put(
  "/:staffId",
  auth.isAuthenticated,
  validation.saveStaff,
  staffController.updateStaff
);
router.delete("/:staffId", auth.isAuthenticated, staffController.deleteStaff);

module.exports = router;
