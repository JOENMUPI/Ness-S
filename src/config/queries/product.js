const table = 'product';

module.exports = {
    // Insert
    createProduct: `INSERT INTO ${ table } (product_nam, product_des, product_pri, product_img, product_tag_ide, enterprise_ide) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,    
   
    // Select
    getProductByEnterpriseId: `SELECT p.*, pt.* FROM ${ table } AS p
    JOIN product_tag As pt ON pt.product_tag_ide = p.product_tag_ide
    WHERE (p.enterprise_ide = $1 AND p.product_sts = true)
    ORDER BY p.product_nam ASC`,
    searchProductByName: `SELECT * FROM ${ table } AS p
    JOIN product_tag AS pt ON pt.product_tag_ide = p.product_tag_ide  
    JOIN enterprise AS e ON e.enterprise_ide = pt.enterprise_ide
    WHERE (UPPER(p.product_nam) LIKE $1`,
    
    // Update
    updateProductById: `UPDATE ${ table } 
    SET product_nam = $1, product_des = $2, product_pri = $3, product_img = $4, product_sta = $5, product_tag_ide = $6  
    WHERE (product_ide = $7 AND enterprise_ide = $8)`,
    productOffById: `UPDATE ${ table } SET product_sts = false 
    WHERE (product_ide = $1 AND enterprise_ide = $2)`


    // Delete
};