const router = require('express').Router();

const lendingRecordsController = require('../controllers/lending-records');
const validation = require('..middleware/validation_Middleware');

router.get('/', lendingRecordsController.getAll);
router.get('/:id', lendingRecordsController.getSingle);
router.post('/', validation.saveLendingRecord, lendingRecordsController.createLendingRecord);
router.put('/:id', validation.saveLendingRecord, lendingRecordsController.updateLendingRecord);
router.delete('/:id', lendingRecordsController.deleteLendingRecord);

module.exports = router;

