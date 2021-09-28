const table = 'deposit';

module.exports = {
    // Insert
    createLocation: `INSERT INTO ${ table } (deposit_dat_cre, deposit_sta, deposit_mou_tra, deposit_mou_dep, deposit_type_ide, deposit_img, user_ide) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,    
   
    
    // Select
    getDepositByUserId: `SELECT d.*, dt.* FROM ${ table } AS d 
    JOIN deposit_type AS dt ON dt.deposit_type_ide = d.deposit_type_ide
    WHERE d.user_ide = $1
    ORDER BY d.deposit_ide DESC`,

    
    // Update
    

    // Delete
};