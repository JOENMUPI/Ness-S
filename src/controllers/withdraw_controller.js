const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesWithdraw = require('../config/queries/withdraw');
const dbQueriesEnterpriseWithdraw = require('../config/queries/enterprise_withdraw');
const dbQueriesAdmin = require('../config/queries/admin');
const dbQueriesEnterprise = require('../config/queries/enterprise');
const jwt = require('jsonwebtoken');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataTowithdraw = (rows) => {
    const withdraws = [];
        
    rows.forEach(element => { 
        let aux = { 
            id: element.withdraw_ide,
            mountTotransfer: element.withdraw_mou_tra,
            mountToWithdraw: element.withdraw_mou_ret,
            status: element.withdraw_sta,
            mount_date: element.withdraw_dat_cre,
            countBank: {
                countNum: element.pgp_sym_decrypt,
                titularName: element.count_bank_tit,
                titularId: element.count_bank_tit_ide,
                countBankId: element.count_bank_ide,
                bankName: element.bank_des,
                bankId: element.bank_ide,
            }
        }

        withdraws.push(aux);
    });

    return withdraws;
}


// Logic
const getWithdrawByEnterpriseId = (req, res) => { 
    const token = req.headers['x-access-token'];
    const { enterpriseId } = req.params;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arraux = [ tokenDecoded.id, enterpriseId ];
                let data = await pool.query(dbQueriesAdmin.checkAdmin, arraux);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
        
                } else {
                    arraux = [ enterpriseId, process.env.AES_KEY ];
                    let data = await pool.query(dbQueriesEnterpriseWithdraw.getEnterpriseWithdrawByEnterpriseId, arraux);
                    
                    (!data)
                    ? res.json(newReponse('Error al encontrar los retiros', 'Error', { }))
                    : (data.rowCount > 0) 
                    ? res.json(newReponse('Retiros localizados', 'Success', dataTowithdraw(data.rows)))
                    : res.json(newReponse('Sin retiros', 'Success', []));
                }
            }
        });
    }
}

const createEnterpriseWithdraw = (req, res) => { 
    const token = req.headers['x-access-token'];
    const { enterpriseId, mountTotransfer, mountToWithdraw, countBank } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else { 
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arrAux = [ tokenDecoded.id, enterpriseId ];
                let data = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
        
                } else {
                    let data2 = await pool.query(dbQueriesEnterprise.getEnterpriseById, [ enterpriseId ]);
                    
                    if (!data2) {
                        res.json(newReponse('Error buscando el negocio', 'Error'))
                        
                    } else {
                        const newBalance = data2.rows[0].enterprise_bal - Number.parseFloat(mountToWithdraw);
                        
                        if(newBalance < 0) {
                            res.json(newReponse('Su retiro es mayor a su verdadero balance', 'Caso tesis'))
                        
                        } else {
                            arrAux = [ new Date(), true, mountTotransfer, mountToWithdraw ];
                            data = await pool.query(dbQueriesWithdraw.createWithdraw, arrAux);
                            
                            if(!data) {
                                res.json(newReponse('Error al crear retiro', 'Error', { }));
                                
                            } else {
                                let arrAux2 = [ data.rows[0].withdraw_ide, enterpriseId, countBank.countBankId ];
                                data2 = await pool.query(dbQueriesEnterpriseWithdraw.createEnterpriseWithdraw, arrAux2);
                                
                                if(!data2) {
                                    res.json(newReponse('Error relacionando retiro con empresa', 'Error'));
                                    
                                } else {
                                    arrAux2 = [ newBalance, enterpriseId ];    
                                    data2 = await pool.query(dbQueriesEnterprise.updateBalanceById, arrAux2);
            
                                    (!data2)
                                    ? res.json(newReponse('Error actualizando balance del negocio', 'Error'))
                                    : res.json(newReponse('Retiro enviado', 'Success')); 
                                }
                            }
                        }
                    }
                }
            }
        }); 
    }
}


// Export
module.exports = { 
    getWithdrawByEnterpriseId,
    createEnterpriseWithdraw
}