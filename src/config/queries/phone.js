const table = 'phone';

module.exports = {
    // Insert
    createPhoneNumber: `INSERT INTO ${ table } (phone_cod, phone_num) 
    VALUES ('+58', PGP_SYM_ENCRYPT($1::VARCHAR, $2))  RETURNING *`,
    

    // Select 
    getOnlyPhoneNumberById: `SELECT PGP_SYM_decrypt(phone_num, $2) FROM ${ table } WHERE phone_ide = $1`,
    getPhoneNumberByNum: `SELECT * FROM ${ table } 
    WHERE PGP_SYM_decrypt(phone_num, $2) = $1`,


    // Update
    
    // Delete 
};