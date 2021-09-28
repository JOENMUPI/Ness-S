const table = 'withdraw';

module.exports = {
    // Insert
    createWithdraw: `INSERT INTO ${ table } (withdraw_dat_cre, withdraw_sta, withdraw_mou_tra, withdraw_mou_ret) 
    VALUES ($1, $2, $3, $4) RETURNING *`,    
   
    
    // Select
    
    
    // Update
    

    // Delete
    
};