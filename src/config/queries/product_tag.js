const table = 'product_tag';

module.exports = {
    // Insert
    createProductTag: `INSERT INTO ${ table } (product_tag_des, enterprise_ide) 
    VALUES ($1, $2) RETURNING *`,    
   
    
    // Select
    getProductTagByEnterpriseId: `SELECT * FROM ${ table }
    WHERE enterprise_ide = $1`,

    
    // Update
    updateProductTagById: `UPDATE ${ table } 
    SET product_tag_des = $1  
    WHERE (product_tag_ide = $2 AND enterprise_ide = $3)`,


    // Delete
    deleteProductTagById: `DELETE FROM ${ table } WHERE (product_tag_ide = $1 AND enterprise_ide = $2)`
};