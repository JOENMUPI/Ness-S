const router = require('express').Router();
const direction = require('../controllers/direction_controller');


// Variables
const endPoint = '/direction';


// Get
router.get(`${ endPoint }/user`, direction.getUserLocation);


// Post
router.post(`${ endPoint }/user`, direction.createUserLocation);
router.post(`${ endPoint }/enterprise`, direction.createLocation);


// Put
router.put(endPoint, direction.updateLocation);


// Delete
router.delete(`${ endPoint }/user/:directionId`, direction.deleteUserLocation);


// Export
module.exports = router;