const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesdepositType = require('../config/queries/deposit_type');
const dbQueriesdeposit = require('../config/queries/deposit');
const dbQueriesUser = require('../config/queries/user');
const jwt = require('jsonwebtoken');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToDepositType = (rows) => {  
    const depositTpes = []; 
        
    rows.forEach(element => { 
        let aux = {  
            id: element.deposit_type_ide,
            name: element.deposit_type_nam,
            json: element.deposit_type_jso
        }

        depositTpes.push(aux);
    }); 

    return depositTpes;
}

const dataToDeposit = (rows) => {
    const deposits = [];
        
    rows.forEach(element => { 
        let aux = { 
            id: element.deposit_ide,
            mountTotransfer: element.deposit_mou_tra,
            mountToDeposit: element.deposit_mou_dep,
            status: element.deposit_sta,
            mount_date: element.deposit_dat_cre,
            depositTypeName: element.deposit_type_nam,
            depositTypeId: element.deposit_type_ide,
            depositTypeJson: element.deposit_type_jso 
        }

        deposits.push(aux);
    });

    return deposits;
}


// Logic
const getDepositType = async (req, res) => { 
    const data = await pool.query(dbQueriesdepositType.getAllDepositTypes);
    
    (!data)
    ? res.json(newReponse('Error al encontrar las cuentas', 'Error', { }))
    : (data.rowCount > 0) 
    ? res.json(newReponse('Cuentas encontradas', 'Success', dataToDepositType(data.rows)))
    : res.json(newReponse('Cuentas no encontradas', 'Success', { }));
}

const getDepositByUser = async (req, res) => { 
    const token = req.headers['x-access-token'];

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else { 
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const data = await pool.query(dbQueriesdeposit.getDepositByUserId, [ tokenDecoded.id ]);

        (data.rowCount < 1)
        ? res.json(newReponse('Historial vacio', 'Success', []))
        : res.json(newReponse('Hitorial encontrado', 'Success', dataToDeposit(data.rows))); 
    }
}

const createDeposit = async (req, res) => { 
    const token = req.headers['x-access-token'];
    const { img, mountTotransfer, mountToDeposit, depositTypeId } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else { 
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const arrAux = [ 
            new Date(), 
            true, 
            mountTotransfer, 
            mountToDeposit, 
            depositTypeId, 
            img.img, 
            tokenDecoded.id 
        ];

        const data = await pool.query(dbQueriesdeposit.createLocation, arrAux);
    
        if (!data) {
            res.json(newReponse('Error al crear deposito', 'Error', { }));

        } else {
            let data2 = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
            
            if(!data2) { 
                res.json(newReponse('Usuario no encontrado', 'Error', { }))
            
            } else {
                const newBalance = Number.parseFloat(mountToDeposit) + data2.rows[0].user_bal; 
                data2 = await pool.query(dbQueriesUser.updateBalanceById, [ newBalance, tokenDecoded.id ]);
                
                !(data2)
                ? res.json(newReponse('Error actualizando balance', 'Error', { }))
                : res.json(newReponse('Deposito registrado', 'Success', { })); 
            }
        }
    }
}


// Export
module.exports = { 
    getDepositType,
    getDepositByUser,
    createDeposit
}