const router = require('express').Router();
const controller = require('../controllers/bill_controller');


// Variables
const endPoint = '/bill';


// Get
router.get(`${endPoint}/user`, controller.getBillByUserId);

// Post
router.post(endPoint, controller.createBill);


// Put


// Delete


// Export
module.exports = router;