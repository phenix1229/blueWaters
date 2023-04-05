const express = require('express');
const router = express.Router();
require('../../lib/passport');

const userController = require('./controllers/userController');
const userValidation = require('./utils/userValidation');

//register new member
router.post('/saveMember', userController.saveMember);

//create new member
router.post('/newMember', userController.newMember);

//find member
router.post('/findMember', userController.findMember);

//save new transaction
router.post('/saveTransaction', userController.saveTransaction);

//render members page
router.get('/members', userController.membersPage);

//render transactions page
router.get('/transactions', userController.transactionsPage);

// router.post('/checkMember', userController.checkMember);

//render member info page
// router.get('/memberInfo', userController.memberInfoPage);

//render login error page
// router.get('/loginError', userController.loginError);

//update member
router.post('/updateMember', userController.updateMember);


module.exports = router;