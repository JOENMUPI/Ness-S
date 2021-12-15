const router = require('express').Router();
const controller = require('../controllers/cart_controller');


// Variables
const endPoint = '/cart';



// Get
router.get(endPoint, controller.getCartByUserId);

// Post
router.post(endPoint, controller.createCart);


// Put


// Delete
router.delete(endPoint, controller.deleteCartById);
router.delete(`${endPoint}/enterprise`, controller.deleteCartByEnnterprise);

// Export
module.exports = router;