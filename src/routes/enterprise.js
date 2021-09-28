const router = require('express').Router();
const controller = require('../controllers/enterprise_controller');


// Variables
const endPoint = '/enterprise';


// Get
router.get(`${ endPoint }/:enterpriseId`, controller.refreshEnterprise);


// Post
router.post(`${ endPoint }/code`, controller.checkCode);
router.post(endPoint, controller.createEnterprise);


// Put
router.put(`${ endPoint }/img`, controller.updateImgByEnterpriseId);
router.put(`${ endPoint }/hour`, controller.updateHourDayByEnterpriseId);

// Delete


// Export
module.exports = router;