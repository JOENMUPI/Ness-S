const table = 'admin';

module.exports = {
    // Insert
    createAdmin: `INSERT INTO ${ table } (user_ide, enterprise_ide, admin_cod) 
    VALUES ($1, $2, PGP_SYM_ENCRYPT($3::VARCHAR, $4))`,    
   
    
    // Select
    checkAdmin: `SELECT * FROM ${ table } WHERE (user_ide = $1 AND enterprise_ide = $2)`,
    getAdminByuserId: `SELECT * FROM ${ table } WHERE user_ide = $1`,
    getEnterpriseIdByuserIdAndCode: `SELECT * FROM ${ table } 
    WHERE (user_ide = $1 AND PGP_SYM_decrypt(admin_cod, $3) = $2)`,

    // Update
    

    // Delete
    deleteAdminById: `DELETE ${ table }  WHERE user_ide = $1 AND enterprise_ide = $2)`
};