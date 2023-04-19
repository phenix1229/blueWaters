const express = require('express');
const router = express.Router();
require('../../lib/passport');

const userController = require('./controllers/userController');

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

//create member invoice
router.post('/createInvoice', userController.createInvoice);

//render members page
router.get('/members', userController.membersPage);

//render member invoices
router.get('/memberInvoices', userController.memberInvoicesPage);

//render transactions page
router.get('/transactions', userController.transactionsPage);

//render member fees page
router.get('/memberFees', userController.memberFeesPage);

//render reports page
router.get('/reports', userController.reportsPage);

//render monthly invoice page
router.get('/monthlyInvoice', userController.monthlyInvoicePage);

//update member
router.post('/updateMember', userController.updateMember);

//update member fee
router.post('/updateMemberFee', userController.updateMemberFee);

//render monthly summary by area
router.get('/monthlySummary', userController.monthlySummaryPage);

//render create monthly summary date page
router.get('/createMonthlySummary', userController.createMonthlySummaryPage)

//create monthly summary
router.post('/createMonthlySummary', userController.createMonthlySummary)

//render daily summary by area
router.get('/dailySummary', userController.dailySummaryPage);

//render create summary date page
router.get('/createDailySummary', userController.createDailySummaryPage)

//create monthly summary
router.post('/createDailySummary', userController.createDailySummary)

//render monthly member sales
router.get('/monthlyMemberSales', userController.monthlyMemberSalesPage);

//render create monthly member sales page
router.get('/createMonthlyMemberSales', userController.createMonthlyMemberSalesPage)

//create monthly member sales
router.post('/createMonthlyMemberSales', userController.createMonthlyMemberSales)

module.exports = router;