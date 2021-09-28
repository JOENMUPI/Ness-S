const table = 'enterprise_bank';

module.exports = {
    // Insert
    createenterpriseBank: `INSERT INTO ${ table } (enterprise_ide, count_bank_ide) 
    VALUES ($1, $2)`,    
   
    
    // Select
    getCountBankByEnterpriseId: `SELECT b.*, cb.*, eb.*, PGP_SYM_decrypt(count_bank_num, $2) FROM ${ table } AS eb
    JOIN count_bank AS cb ON eb.count_bank_ide = cb.count_bank_ide
    JOIN bank As b ON b.bank_ide = cb.bank_ide
    WHERE (enterprise_ide = $1 AND enterprise_bank_sta = true)`,
    checkEnterprisBankById: `SELECT * FROM ${ table } 
    WHERE (enterprise_ide = $1 AND count_bank_ide = $2)`,

    
    // Update
    updateStatusById: `UPDATE ${ table } SET enterprise_bank_sta = $1  
    WHERE (enterprise_ide = $2 AND count_bank_ide = $3)`,


    // Delete
};