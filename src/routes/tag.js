const router = require('express').Router();
const controller = require('../controllers/tag_controller');


// Variables
const endPoint = '/tag';


// Get
router.get(endPoint, controller.getTags);


// Post


// Put


// Delete


// Export
module.exports = router;