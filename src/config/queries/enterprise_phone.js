const table = 'enterpise_phone';

module.exports = {
    // Insert
    createEnterprisePhone: `INSERT INTO ${ table } (phone_ide, enterprise_ide) VALUES ($1, $2)`,
 

    // Select 
    getPhoneByEnterpriseId: `SELECT p.phone_cod, p.phone_ide, PGP_SYM_decrypt(p.phone_num, $2) 
    FROM ${ table } AS ep
    JOIN phone As p ON ep.phone_ide = p.phone_ide 
    WHERE ep.enterprise_ide = $1`,
    getPhoneEnterpriseById: `SELECT * FROM ${ table } WHERE (enterprise_ide = $1 AND phone_ide = $2)`,
    

    // Update
    
    
    // Delete 
    deleteEnterprisePhoneById: `DELETE FROM ${ table } WHERE (enterprise_ide = $1 AND phone_ide = $2)`
};