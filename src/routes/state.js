const router = require('express').Router();
const state = require('../controllers/state_controller');


// Variables
const endPoint = '/state';


// Get
router.get(endPoint, state.getStates);

// Post



// Put


// Delete


// Export
module.exports = router;