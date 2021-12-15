const router = require('express').Router();
const controller = require('../controllers/enterprise_controller');


// Variables
const endPoint = '/enterprise';


// Get
router.get(`${ endPoint }/:enterpriseId`, controller.refreshEnterprise);
router.get(`${ endPoint }/tag/:tagId`, controller.getEnterprisesBytagId);
router.get(`${ endPoint }/sell/:enterpriseId`, controller.getSellByEnterpriseId);
router.get(`${ endPoint }/search/:search`, controller.SearchEnterprise);

// Post
router.post(`${ endPoint }/code`, controller.checkCode);
router.post(endPoint, controller.createEnterprise);
router.post(`${ endPoint }/tesis`, controller.tesis);


// Put
router.put(`${ endPoint }/img`, controller.updateImgByEnterpriseId);
router.put(`${ endPoint }/hour`, controller.updateHourDayByEnterpriseId);

// Delete


// Export
module.exports = router;