const router = require('express').Router();
const phone = require('../controllers/phone_controller');


// Variables
const endPoint = '/phone';


// Get


// Post
router.post(`${ endPoint }/check`, phone.checkPhoneNumber);
router.post(`${ endPoint }/enterprise`, phone.createEnterprisePhone);

// Put


// Delete
router.delete(`${ endPoint }/enterprise/:enterpriseId/:phoneId`, phone.deleteEnterprisePhone);

// Export
module.exports = router;