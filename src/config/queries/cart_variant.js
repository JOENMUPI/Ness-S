const table = 'cart_variant';

module.exports = {
    // Insert
    createVariantCart: `INSERT INTO ${ table } (cart_ide, variant_ide) 
    VALUES ($1, $2)`,    
   
    
    // Select
    getCartVariantByCartId: `SELECT * FROM ${ table } AS cv
    JOIN variant AS v ON v.variant_ide = cv.variant_ide
    WHERE cv.cart_ide = $1 AND v.variant_sts = true`,
    
    // Update
    

    // Delete
};