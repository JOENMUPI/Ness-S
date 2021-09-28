const router = require('express').Router();
const controller = require('../controllers/bank_controller');


// Variables
const endPoint = '/bank';


// Get
router.get(endPoint, controller.getBanks);

// Post
router.post(`${ endPoint }/enterprise`, controller.createEnterpriseBank);


// Put
router.put(`${ endPoint }/enterprise`, controller.updateStateEnterpriseBank);


// Delete


// Export
module.exports = router;