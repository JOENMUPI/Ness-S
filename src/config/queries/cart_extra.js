const table = 'cart_extra';

module.exports = {
    // Insert
    createExtraCart: `INSERT INTO ${ table } (cart_ide, extra_ide) 
    VALUES ($1, $2)`,    
   
    
    // Select
    getCartExtraByCartId: `SELECT * FROM ${ table } AS ce
    JOIN extra AS e ON e.extra_ide = ce.extra_ide
    WHERE ce.cart_ide = $1 AND e.extra_sts = true`,

    
    // Update
    

    // Delete
};