const router = require('express').Router();
const controller = require('../controllers/productTag_controller');


// Variables
const endPoint = '/product-tag';


// Get


// Post
router.post(endPoint, controller.createProductTag);


// Put
router.put(endPoint, controller.updateProductTag);


// Delete
router.delete(`${ endPoint }/:enterpriseId/:productTagId`, controller.deleteProductTag);

// Export
module.exports = router;