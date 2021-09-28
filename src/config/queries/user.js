const table = 'user_1';

module.exports = {
    // Insert
    createUser: `INSERT INTO ${ table } (user_nam, user_ema, user_pas, phone_ide)
    VALUES ($1, $2, $3, $4) RETURNING *`,
    

    // Select 
    getAllUsers: `SELECT * FROM ${ table }`, 
    getUserById: `SELECT * FROM ${ table } WHERE user_ide = $1`,
    //getUserByName: `SELECT * FROM ${ table } WHERE UPPER(user_nam) LIKE $1`,
    getUserByEmail: `SELECT * FROM ${ table } WHERE user_ema = $1`,


    // Update
    updatePassById: `UPDATE ${ table } SET user_pas = $1 WHERE (user_ide = $2 AND user_pas = $3)`,
    updateBalanceById: `UPDATE ${ table } SET user_bal = $1 WHERE user_ide = $2`, 

    // Delete
};