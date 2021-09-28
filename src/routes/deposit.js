const router = require('express').Router();
const deposit = require('../controllers/deposit_controller');


// Variables
const endPoint = '/deposit';


// Get
router.get(`${ endPoint }/depositType`, deposit.getDepositType);
router.get(endPoint, deposit.getDepositByUser);


// Post
router.post(endPoint, deposit.createDeposit);

// Put


// Delete


// Export
module.exports = router;