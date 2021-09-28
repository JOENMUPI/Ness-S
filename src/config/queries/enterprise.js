const table = 'enterprise';

module.exports = {
    // Insert
    createEnterprise: `INSERT INTO ${ table } (enterprise_nam, enterprise_img, enterprise_doc_jso, enterprise_day_ope_jso, location_ide, enterprise_pet_sta) 
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING *`,    
   
    
    // Select
    getEnterpriseById: `SELECT * FROM ${ table } WHERE enterprise_ide = $1`,
    
    
    // Update
    updateEnterpriseById: `UPDATE ${ table } 
    SET enterprise_img = $1, enterprise_day_ope_jso = $2, enterprise_sta = $3  
    WHERE enterprise_ide = $4 `,
    updateBalanceById: `UPDATE ${ table } SET enterprise_bal = $1 WHERE enterprise_ide = $2`,
    updateHourDaysById: `UPDATE ${ table } SET enterprise_day_ope_jso = $1 WHERE enterprise_ide = $2`,
    updateImgById: `UPDATE ${ table } SET enterprise_img = $1 WHERE enterprise_ide = $2`,


    // Delete
    
};