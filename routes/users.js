const express = require('express');
const router  = express.Router();
const userController = require('../controllers/users')
const validation = require('../middleware/validation_Middleware');
const auth = require ('../middleware/authenticate');



router.get('/', userController.getAll);
router.get('/:id',userController.getsingle);
router.post('/', auth.isAuthenticated, validation.saveUser, userController.createUser);
router.put('/:id', auth.isAuthenticated, validation.saveUser, userController.updateUser);
router.delete('/:id', auth.isAuthenticated, userController.deleteUser);






module.exports = router;


