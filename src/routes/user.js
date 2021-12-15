const router = require('express').Router();
const user = require('../controllers/user_controller');


// Variables
const endPoint = '/user';

// Get
router.get(`${ endPoint }/id`, user.getUserById);
router.get(`${ endPoint }/phoneNumber/:userId`, user.getNumByUserId);


// Post
router.post(`${ endPoint }/singup`, user.createUsers);
router.post(`${ endPoint }/singin`, user.login);
router.post(`${ endPoint }/check/email`, user.checkEmail);


// Put
router.put(`${ endPoint }/pass`, user.updatePass);
router.put(`${ endPoint }/field`, user.updateField);

// Delete


// Export
module.exports = router;