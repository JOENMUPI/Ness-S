const table = 'enterprise';

module.exports = {
    // Insert
    createEnterprise: `INSERT INTO ${ table } (enterprise_nam, enterprise_img, enterprise_doc_jso, enterprise_day_ope_jso, location_ide, enterprise_pet_sta) 
    VALUES ($1, $2, $3, $4, $5, true)
    RETURNING *`,    
   
    
    // Select
    getEnterpriseById: `SELECT * FROM ${ table } WHERE enterprise_ide = $1`,
    searchEnterpriseByName: `SELECT * FROM ${ table } WHERE UPPER(enterprise_nam) LIKE $1`,
    getSellByenterpriseId: `select * from ${ table } As e
        JOIN product_tag AS pt ON pt.enterprise_ide = e.enterprise_ide
        JOIN product AS p ON p.product_tag_ide = pt.product_tag_ide
        JOIN cart AS c ON c.product_ide = p.product_ide
        JOIN bill_cart AS bc ON bc.cart_ide = c.cart_ide
        JOIN bill AS b ON b.bill_ide = bc.bill_ide
        JOIN user_1 AS u ON u.user_ide = b.user_ide
        JOIN location AS l On l.location_ide = b.location_ide 
        JOIN city AS cc ON cc.city_ide = l.city_ide
        JOIN state AS s ON s.state_ide = cc.state_ide
    where e.enterprise_ide = $1`,

    // Update
    updateEnterpriseById: `UPDATE ${ table } 
    SET enterprise_img = $1, enterprise_day_ope_jso = $2, enterprise_sta = $3  
    WHERE enterprise_ide = $4 `,
    updateBalanceById: `UPDATE ${ table } SET enterprise_bal = $1 WHERE enterprise_ide = $2`,
    updateHourDaysById: `UPDATE ${ table } SET enterprise_day_ope_jso = $1 WHERE enterprise_ide = $2`,
    updateImgById: `UPDATE ${ table } SET enterprise_img = $1 WHERE enterprise_ide = $2`,


    // Delete
    
};