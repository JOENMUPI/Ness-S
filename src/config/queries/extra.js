const table = 'extra';

module.exports = {
    // Insert
    createExtra: `INSERT INTO ${ table } (extra_nam, extra_pri, product_ide) 
    VALUES ($1, $2, $3) RETURNING *`,    
   
    
    // Select
    getExtraByProductId: `SELECT * FROM ${ table } WHERE (product_ide = $1 AND extra_sts = true) 
    ORDER BY extra_nam ASC`,

    
    // Update
    updateExtraById: `UPDATE ${ table } SET extra_nam = $1, extra_pri = $2, extra_sta = $3,  
    WHERE (extra_ide = $4 AND product_ide = $5)`,
    extraOffById: `UPDATE ${ table } SET extra_sts = $1 
    WHERE (extra_ide = $2 AND product_ide = $3)`


    // Delete
};