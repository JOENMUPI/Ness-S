const router = require('express').Router();
const user = require('../controllers/user_controller');


// Variables
const endPoint = '/user';

// Get
router.get(`${ endPoint }/id`, user.getUserById);


// Post
router.post(`${ endPoint }/singup`, user.createUsers);
router.post(`${ endPoint }/singin`, user.login);
router.post(`${ endPoint }/check/email`, user.checkEmail);


// Put


// Delete


// Export
module.exports = router;