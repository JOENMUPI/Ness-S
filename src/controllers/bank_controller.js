const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesBank = require('../config/queries/banks');
const dbQueriesCountBank = require('../config/queries/count_bank');
const dbQueriesEnterpriseBank = require('../config/queries/enterprise_bank');
const dbQueriesAdmin = require('../config/queries/admin');
const jwt = require('jsonwebtoken');

// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToBank = (rows) => {
    const banks = [];
        
    rows.forEach(element => { 
        let aux = { 
            name: element.bank_des,
            id: element.bank_ide
        }

        banks.push(aux);
    }); 

    return banks;
}

// Logic
const getBanks = async (req, res) => {
    const data = await pool.query(dbQueriesBank.getBanks);

    (data.rowCount < 1) 
    ? res.json(newReponse('Bancos no econtrados', 'Success', []))
    : res.json(newReponse('Bancos encontrados', 'Success', dataToBank(data.rows)));
}

const createEnterpriseBank = (req, res) => {
    const token = req.headers['x-access-token'];
    const { countNum, titularName, titularId, bankId, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else { 
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arrAux = [ tokenDecoded.id, enterpriseId ];
                let countBankData = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);
                let countBankId;
                
                if(countBankData.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'))
        
                } else { 
                    arrAux = [ countNum, process.env.AES_KEY ];
                    countBankData = await pool.query(dbQueriesCountBank.getEnterpriseByNum, arrAux); 
            
                    if (countBankData.rowCount > 0) { 
                        countBankId = countBankData.rows[0].count_bank_ide; 
                        
                    } else { 
                        arrAux = [ titularName, titularId, countNum, bankId, process.env.AES_KEY ]; 
                        countBankData = await pool.query(dbQueriesCountBank.createCountBank, arrAux);
                        
                        (!countBankData)
                        ? res.json(newReponse('Error creando la cuenta bancaria', 'Error'))
                        : countBankId = countBankData.rows[0].count_bank_ide;
                    }
            
                    arrAux = [ enterpriseId, countBankId ]; 
                    countBankData = await pool.query(dbQueriesEnterpriseBank.checkEnterprisBankById, arrAux);
            
                    if(countBankData.rowCount > 0) {
                        if (!countBankData.rows[0].enterprise_bank_sta) {
                            const aux2 = [ true, enterpriseId, countBankId ]; 
                            countBankData = await pool.query(dbQueriesEnterpriseBank.updateStatusById, aux2);    
                        } 
            
                        res.json(newReponse('Cuenta bancaria relacionada', 'Success', { id: countBankId }));
                        
                    } else {
                        countBankData = await pool.query(dbQueriesEnterpriseBank.createenterpriseBank, arrAux);
                        
                        (!countBankData)
                        ? res.json(newReponse('Error relacionando la cuenta bancaria', 'Error'))
                        : res.json(newReponse('Cuenta bancaria relacionada', 'Success', { id: countBankId }));
                    }
                }
            }
        }); 
    }
}

const updateStateEnterpriseBank = (req, res) => {
    const token = req.headers['x-access-token'];
    const { countBankId, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arrAux = [ tokenDecoded.id, enterpriseId ];
                let data = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'))
                
                } else {
                    arrAux = [ false, enterpriseId, countBankId ];
                    data = await pool.query(dbQueriesEnterpriseBank.updateStatusById, arrAux);
            
                    (!data) 
                    ? res.json(newReponse('Error actualizando status de relacion cuenta/empresa', 'Error'))
                    : res.json(newReponse('Relacion cuenta/empresa actualizada', 'Success'));
                }
            }
        }); 
    }
}


// Export
module.exports = { 
    getBanks,
    createEnterpriseBank,
    updateStateEnterpriseBank
}