const table = 'enterprise_withdraw';

module.exports = {
    // Insert
    createEnterpriseWithdraw: `INSERT INTO ${ table } (withdraw_ide, enterprise_ide, count_bank_ide)    
    VALUES ($1, $2, $3)`,    
   
    
    // Select
    getEnterpriseWithdrawByEnterpriseId: `SELECT PGP_SYM_decrypt(count_bank_num, $2), w.*, ew.*, b.*, cb.* FROM ${ table } AS ew 
    JOIN withdraw AS w ON ew.withdraw_ide = w.withdraw_ide
    JOIN count_bank AS cb ON cb.count_bank_ide = ew.count_bank_ide
    JOIN bank AS b ON b.bank_ide = cb.bank_ide
    WHERE ew.enterprise_ide = $1`,

    // Update
    

    // Delete
};