const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesBill = require('../config/queries/bill');
const dbQueriesCart = require('../config/queries/cart');
const dbQueriesBillCart = require('../config/queries/bill_cart');
const dbQueriesUser = require('../config/queries/user');
const jwt = require('jsonwebtoken');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToBill = (rows) => {
    const bills = [];
        
    rows.forEach(element => { 
        let aux = { 
            id: element.bill_ide,
            mount: element.bill_mou,
            status: element.bill_sta,
            date: element.bill_dat_cre,
            products: element.bill_data_jso.data,
            location: {  
                cityId: element.city_ide,
                stateId: element.state_ide,
                locationId: element.location_ide,
                locationDescription: element.location_des,
                locationName: element.location_nam,
                cityName: element.city_nam,
                stateName: element.state_nam,
                coordinate: {
                    latitude: element.location_lat,
                    longitude: element.location_lon
                }
            }
        }

        bills.push(aux);
    });

    return bills;
}


// Logic
const getBillByUserId = (req, res) => { 
    const token = req.headers['x-access-token'];
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesBill.getBillByUserId, [ tokenDecoded.id ]);
                
                (data.rowCount < 1) 
                ? res.json(newReponse('sin envios previamennte hechos', 'Success', []))
                : res.json(newReponse('Envios localizados', 'Success', dataToBill(data.rows)));
            }
        });
    }
}

const createBill = (req, res) => {  
    const token = req.headers['x-access-token'];
    const { mount, products, location } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else { 
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const arrAux = [ new Date(), null, mount, { data: products }, tokenDecoded.id, location.locationId ];
                let data = await pool.query(dbQueriesBill.createBill, arrAux);
        
                if(!data) {
                    res.json(newReponse('Error ingresando pedido', 'Error'))

                } else {
                    products.forEach(async (product) => { console.log('hola', [ product.cart.id, tokenDecoded.id ], [ product.cart.id, data.rows[0].bill_ide ])
                        const auxData = await pool.query(dbQueriesBillCart.createBillCart, [ product.cart.id, data.rows[0].bill_ide ])
                        const cartData = await pool.query(dbQueriesCart.deleteCArtByCartId, [ product.cart.id, tokenDecoded.id ]);
                        console.log('hola', [ product.cart.id, tokenDecoded.id ]) 
                    });

                    let userData = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
                    const newBalance = userData.rows[0].user_bal - mount; 
                    const arrAux2 = [ newBalance, tokenDecoded.id ];
                    userData = await pool.query(dbQueriesUser.updateBalanceById, arrAux2);
                    
                    (!userData)
                    ? res.json(newReponse('Error actualizando balance de usuario', 'Error'))
                    : res.json(newReponse('Pedido solicitado exitosamente', 'Success'));
                }
            }
        }); 
    }
}

// Export
module.exports = { 
    getBillByUserId,
    createBill,
}