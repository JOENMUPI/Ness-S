const table = 'cart';

module.exports = {
    // Insert
    createCart: `INSERT INTO ${ table } (user_ide, product_ide, cart_num) 
    VALUES ($1, $2, $3) RETURNING cart_ide`,    
   
    
    // Select
    getCartByUserId: `SELECT * FROM ${ table } AS c
        JOIN product AS p ON p.product_ide = c.product_ide
        JOIN product_tag AS pt ON pt.product_tag_ide = p.product_tag_ide
        JOIN enterprise AS e ON e.enterprise_ide = pt.enterprise_ide
    WHERE c.user_ide = $1 
        AND p.product_sts = true 
        AND pt.product_tag_sts = true 
        AND e.enterprise_sta = true
        AND c.cart_sta = true`,
        

    // Update
    

    // Delete
    deleteCArtByCartId: `UPDATE ${ table } SET cart_sta = false WHERE (cart_ide = $1 AND user_ide = $2)`,
    deleteCArtByEnterpriseId: `update ${ table } AS c SET cart_sta = false 
        FROM  product AS p 
            JOIN product_tag AS pt ON p.product_tag_ide = pt.product_tag_ide
            JOIN enterprise AS e ON e.enterprise_ide = pt.enterprise_ide 
	WHERE c.product_ide = p.product_ide
        AND e.enterprise_ide = $1 
        AND c.user_ide = $2
        `,
};