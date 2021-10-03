const router = require('express').Router();
const controller = require('../controllers/product_controller');


// Variables
const endPoint = '/product';


// Get


// Post
router.post(endPoint, controller.createProduct);


// Put
router.put(endPoint, controller.updateProductById);
router.put(`${ endPoint }/status`, controller.updatestatusByProductId);


// Delete

// Export
module.exports = router;