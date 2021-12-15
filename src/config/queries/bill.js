const table = 'bill';

module.exports = {
    // Insert
    createBill: `INSERT INTO ${ table } (bill_dat_cre, bill_sta, bill_mou, bill_data_jso, user_ide, location_ide) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`,    
    
    // Select
    getBillByUserId: `SELECT * FROM ${ table } AS b
    JOIN location AS l On l.location_ide = b.location_ide 
    JOIN city AS c ON c.city_ide = l.city_ide
    JOIN state AS s ON s.state_ide = c.state_ide 
    WHERE b.user_ide = $1`,
    getBillById: `SELECT * FROM ${ table } AS b 
    JOIN location AS l On l.location_ide = b.location_ide 
    JOIN city AS c ON c.city_ide = l.city_ide
    JOIN state AS s ON s.state_ide = c.state_ide
    WHERE b.bill_ide = $1`,
    
    // Update
    updateStatusById: `UPDATE ${ table } SET bill_sta = $1 WHERE bill_ide = $2`,

    // Delete
};