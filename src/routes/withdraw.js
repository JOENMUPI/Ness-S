const router = require('express').Router();
const controller = require('../controllers/withdraw_controller');


// Variables
const endPoint = '/withdraw';


// Get
router.get(`${ endPoint }/enterprise/:enterpriseId`, controller.getWithdrawByEnterpriseId);

// Post
router.post(`${ endPoint }/enterprise`, controller.createEnterpriseWithdraw);


// Put


// Delete


// Export
module.exports = router;