const express = require('express');
const router = express.Router();
const lendingRecordsController = require('../controllers/lending-records');
const validation = require("../middleware/validationMiddleware");

router.get('/active', lendingRecordsController.getActive);
router.get('/overdue', lendingRecordsController.getOverdue);
router.get('/user/:userId', lendingRecordsController.getByUser);
router.get('/book/:bookId', lendingRecordsController.getByBook);
router.get('/:id', lendingRecordsController.getSingle);
router.get('/', lendingRecordsController.getAll);

router.post(
  "/",
  validation.saveLendingRecord,
  lendingRecordsController.createLendingRecord
);
router.put(
  "/:id",
  validation.saveLendingRecord,
  lendingRecordsController.updateLendingRecord
);
router.delete("/:id", lendingRecordsController.deleteLendingRecord);

module.exports = router;
