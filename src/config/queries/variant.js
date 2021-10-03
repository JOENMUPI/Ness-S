const table = 'variant';

module.exports = {
    // Insert
    createVariant: `INSERT INTO ${ table } (variant_nam, product_ide) 
    VALUES ($1, $2) RETURNING *`,    
   
    
    // Select
    getVariantByProductId: `SELECT * FROM ${ table } WHERE (product_ide = $1 AND variant_sts = true)
    ORDER BY variant_nam ASC`,

    
    // Update
    updateVarinatById: `UPDATE ${ table } SET variant_nam = $1, variant_sta = $2  
    WHERE (variant_ide = $3 AND product_ide = $4)`,
    varinatOffById: `UPDATE ${ table } SET variant_sts = $1 
    WHERE (variant_ide = $2 AND product_ide = $3)`


    // Delete
};