const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const staffValidation = require("../middleware/staffValidation");
const staffAuth = require("../middleware/staffAuth");

/**
 * @swagger
 * /staff:
 *   get:
 *     summary: Get all staff members
 *     description: Retrieves a list of all staff members. Regular staff will see limited info, admins see all fields.
 *     tags: [staff]
 *     security:
 *       - sessionAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of staff members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/StaffListResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       403:
 *         description: Not authorized as staff
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.get("/", staffAuth.isStaff, staffController.getAllStaff);

/**
 * @swagger
 * /staff/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     description: Retrieves detailed information of a specific staff member by ID
 *     tags: [staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the staff member
 *     security:
 *       - sessionAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Staff member retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/StaffResponse'
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       403:
 *         description: Not authorized as staff
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.get("/:id", staffAuth.isStaff, staffController.getStaffById);

/**
 * @swagger
 * /staff:
 *   post:
 *     summary: Create a new staff member
 *     description: Creates a new staff member (admin only). Automatically generates employee code.
 *     tags: [staff]
 *     security:
 *       - sessionAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Staff'
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Staff member created successfully
 *                 data:
 *                   $ref: '#/definitions/Staff'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       403:
 *         description: Not authorized as admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       412:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.post(
  "/",
  staffAuth.isStaff,
  staffAuth.isAdmin,
  staffValidation.validateStaff,
  staffController.createStaff
);

/**
 * @swagger
 * /staff/{id}:
 *   put:
 *     summary: Update staff member
 *     description: Updates the fields of a staff member. Can be used for both full and partial updates. Admin can update any staff, regular staff can only update themselves.
 *     tags: [staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the staff member
 *     security:
 *       - sessionAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Staff'
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Staff member updated successfully
 *                 modifiedCount:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       403:
 *         description: Not authorized to modify this staff member
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       412:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.put(
  "/:id",
  staffAuth.isStaff,
  staffAuth.canModifyStaff,
  staffValidation.validatePartialStaffUpdate,
  staffController.updateStaff
);

/**
 * @swagger
 * /staff/{id}:
 *   delete:
 *     summary: Delete staff member
 *     description: Deletes a staff member (admin only)
 *     tags: [staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the staff member
 *     security:
 *       - sessionAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Staff member deleted successfully
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       403:
 *         description: Not authorized as admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.delete(
  "/:id",
  staffAuth.isStaff,
  staffAuth.isAdmin,
  staffController.deleteStaff
);

/**
 * @swagger
 * /staff/{id}/link-github:
 *   post:
 *     summary: Link GitHub account to staff member
 *     description: Associates a GitHub account with a staff member. User must be logged in via GitHub.
 *     tags: [staff]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the staff member
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: GitHub account linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: GitHub account linked to staff member successfully
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       401:
 *         description: GitHub authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       404:
 *         description: Staff member not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       409:
 *         description: GitHub account already linked to another staff
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
router.post("/:id/link-github", staffController.linkGitHubToStaff);

module.exports = router;
