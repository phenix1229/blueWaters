const express = require('express');
const router = express.Router();
require('../../lib/passport');
const accountController = require('./controllers/accountController');

//render options page
router.get('/options', accountController.options);

//render debit and credit page
router.get('/creditDebit', accountController.creditDebitPage);

//post transaction to account
router.post('/creditDebit', accountController.transaction);

//render checking history page
router.get('/checking', accountController.checking);

//render savings history page
router.get('/savings', accountController.savings);

//render transfer page
router.get('/transfer', accountController.transferPage);

//post transfer between accounts
router.post('/transfer', accountController.transfer);

//render send money page
router.get('/sendMoney', accountController.sendMoneyPage);

//send money from one person to another
router.post('/sendMoney', accountController.sendMoney);

//render statements page
router.get('/statements', accountController.statementsPage);

//post new statement
router.post('/statements', accountController.createStatement);

//render monthly statement
router.get('/monthlyStatement/:account/:month', accountController.monthlyStatement);

//delete monthly statement
router.delete('/deleteStatement/:account/:month', accountController.deleteStatement)


module.exports = router;