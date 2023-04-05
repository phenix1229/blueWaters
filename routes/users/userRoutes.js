const express = require('express');
const router = express.Router();
require('../../lib/passport');

const userController = require('./controllers/userController');
const userValidation = require('./utils/userValidation');

//register new member
router.post('/saveMember', userController.saveMember);

//create new member
router.post('/newMember', userController.newMember);

//create new member fee
router.post('/newMemberFee', userController.newMemberFee);

//find member
router.post('/findMember', userController.findMember);

//find member fee
router.post('/findMemberFee', userController.findMemberFee);

//save new transaction
router.post('/saveTransaction', userController.saveTransaction);

//save new member fee
router.post('/saveMemberFee', userController.saveMemberFee);

//render members page
router.get('/members', userController.membersPage);

//render transactions page
router.get('/transactions', userController.transactionsPage);

//render member fees page
router.get('/memberFees', userController.memberFeesPage);

// router.post('/checkMember', userController.checkMember);

//render member info page
// router.get('/memberInfo', userController.memberInfoPage);

//render login error page
// router.get('/loginError', userController.loginError);

//update member
router.post('/updateMember', userController.updateMember);

//update member fee
router.post('/updateMemberFee', userController.updateMemberFee);


module.exports = router;