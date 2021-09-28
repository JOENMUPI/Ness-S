const table = 'count_bank';

module.exports = {
    // Insert
    createCountBank: `INSERT INTO ${ table } (count_bank_tit, count_bank_tit_ide, count_bank_num, bank_ide) 
    VALUES ($1, $2, PGP_SYM_ENCRYPT($3::VARCHAR, $5), $4) RETURNING *`,    
   
    
    // Select
    getEnterpriseByNum: `SELECT * FROM ${ table } WHERE PGP_SYM_decrypt(count_bank_num, $2) = $1`,
    
    // Update
    

    // Delete
};