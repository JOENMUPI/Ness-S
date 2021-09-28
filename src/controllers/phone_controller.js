const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesPhone = require('../config/queries/phone');
const dbQueriesEnterprisePhone = require('../config/queries/enterprise_phone');

// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToPhone = (phone) => {  
    return {
        phoneId: phone.phone_ide,
        phoneNum: phone.phone_num,
        phoneCode: phone.phone_cod
    }
}


// Logic
const checkPhoneNumber = async (req, res) => {
    const { phoneNumber } = req.body; 
    let data = await pool.query(dbQueriesPhone.getPhoneNumberByNum, [ phoneNumber, process.env.AES_KEY ]);
    
    if(data.rowCount > 0) {
        res.json(newReponse('Numero encontrado', 'Success', dataToPhone(data.rows[0])));
    
    } else {
        data = await pool.query(dbQueriesPhone.createPhoneNumber, [ phoneNumber, process.env.AES_KEY ]);
        res.json(newReponse('Numero creado', 'Success', dataToPhone(data.rows[0])));
    }
}

const createEnterprisePhone = async(req, res) => {
    const token = req.headers['x-access-token'];
    const { phoneNumber, enterpriseId } = req.body; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        let data = await pool.query(dbQueriesPhone.getPhoneNumberByNum, [ phoneNumber, process.env.AES_KEY ]);
        let phoneId; 
    
        if(data.rowCount > 0) { 
           phoneId = data.rows[0].phone_ide; 
        
        } else {
            data = await pool.query(dbQueriesPhone.createPhoneNumber, [ phoneNumber, process.env.AES_KEY ]);
            phoneId = data.rows[0].phone_ide;
        }

        data = await pool.query(dbQueriesEnterprisePhone.getPhoneEnterpriseById, [ enterpriseId, phoneId ]);
        
        if(data.rowCount > 0) {
            res.json(newReponse('Este numero ya esta relacionado con el negocio', 'Error'))

        } else {   
            data = await pool.query(dbQueriesEnterprisePhone.createEnterprisePhone, [ phoneId, enterpriseId ]);
                    
            (!data)
            ? res.json(newReponse('Error relacionando numero con empresa', 'Error'))
            : res.json(newReponse('Numero relacionado exitosamente', 'Success', { id: phoneId }));
        }
    }
}

const deleteEnterprisePhone = async(req, res) => {
    const token = req.headers['x-access-token'];
    const { phoneId, enterpriseId } = req.params; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const arrAux = [ enterpriseId, phoneId ];
        const data = await pool.query(dbQueriesEnterprisePhone.deleteEnterprisePhoneById, arrAux);
        
        (!data)
        ? res.json(newReponse('Error eliminando relacion', 'Error'))
        : res.json(newReponse('Numero eliminado', 'Success'));
    }
}


// Export
module.exports = { 
    checkPhoneNumber,
    createEnterprisePhone,
    deleteEnterprisePhone
}