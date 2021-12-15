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
    getNumByUserId: `SELECT PGP_SYM_decrypt(p.phone_num, $2) FROM ${ table } AS u 
    JOIN phone AS p ON p.phone_ide = u.phone_ide 
    WHERE u.user_ide = $1`,


    // Update
    updatePassById: `UPDATE ${ table } SET user_pas = $1 WHERE user_ide = $2`,
    updateBalanceById: `UPDATE ${ table } SET user_bal = $1 WHERE user_ide = $2`,
    updateNameById: `UPDATE ${ table } SET user_nam = $1 WHERE user_ide = $2`,
    updatEmailById: `UPDATE ${ table } SET user_ema = $1 WHERE user_ide = $2`,
    updatePhoneIdById: `UPDATE ${ table } SET phone_ide = $1 WHERE user_ide = $2`,

    // Delete
};