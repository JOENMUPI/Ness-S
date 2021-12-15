const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesCart = require('../config/queries/cart');
const dbQueriesCartExtra = require('../config/queries/cart_extra');
const dbQueriesCartVariant = require('../config/queries/cart_variant');
const dbQueriesLocation = require('../config/queries/location');
const jwt = require('jsonwebtoken');



// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToEnterprise = (rows) => {  
    const enterprises = []; 
    const history = [0];    

    rows.forEach(element => {
        let flag = false;

        history.forEach(historial => {
            if(historial == element.enterprise_ide) {
                flag = true;
            }
        });

        if(!flag) {
            let aux = { 
                flag: false,
                img: element.enterprise_img,
                hourDay: element.enterprise_day_ope_jso,
                name: element.enterprise_nam,
                status: element.enterprise_sta,
                id: element.enterprise_ide,
                totalCost: 0,
                products: [],
                location: { 
                    id: element.location_ide
                }, 
            }
    
            if(aux.img != null) {
                aux.img = aux.img.toString();
            }

            history.push(aux.id);
            enterprises.push(aux);
        }
    }); 

    return enterprises;
}

const dataToProduct = (enterpriseId, rows)  => {
    let products = [];

    rows.forEach(element => { 
        if(enterpriseId == element.enterprise_ide) {
            let aux = {
                flag: false,
                img: element.product_img,
                name: element.product_nam,
                description: element.product_des,
                id: element.product_ide,
                price: element.product_pri,
                status: element.product_sta,
                extras: [],
                cart: {
                    id: element.cart_ide,
                    totalUnit: element.cart_num,
                    totalMount: 0
                },
                variants: {
                    name: element.variant_nam,
                    id: element.variant_ide,
                    status: element.variant_sta
                },
                productTag: {
                    id: element.product_tag_ide,
                    name: element.product_tag_des
                }
            }

            if(aux.img != null) {
                aux.img = aux.img.toString();
            }
            
            products.push(aux);
        }
    });

    return products;
}

const dataToVariant = (element) => {
    return {
        name: element.variant_nam,
        id: element.variant_ide,
        status: element.variant_sta
    }
}

const dataToExtra = (rows) => {
    const extras = [];

    rows.forEach(element => {
        const aux = {
            name: element.extra_nam,
            id: element.extra_ide,
            price: element.extra_pri,
            status: element.extra_sta
        }

        extras.push(aux);
    });

    return extras;
}

const dataToLocation = (element) => {
    return {  
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

// Logic
const createCart = (req, res) => { 
    const token = req.headers['x-access-token'];
    const { totalUnit, productId, variantId, extras } = req.body; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arrAux = [ tokenDecoded.id, productId, totalUnit ];
                const data = await pool.query(dbQueriesCart.createCart, arrAux);

                if(data.rowCount < 1) {
                    res.json(newReponse('Error inesperado guardando en carrito', 'Error'));
                
                } else { 
                    if(variantId  != 0) {
                        arrAux = [ data.rows[0].cart_ide, variantId ];
                        const data2 = await pool.query(dbQueriesCartVariant.createVariantCart, arrAux);
                        
                        if(!data2) {
                            res.json(newReponse(`Error inesperado guuardando la variante (${ variantId})`, 'Error'));
                        }
                    } 

                    if(extras.length > 0) {
                        for(let i = 0; i < extras.length; i++) {
                            arrAux = [ data.rows[0].cart_ide, extras[i] ];
                            const data3 = await pool.query(dbQueriesCartExtra.createExtraCart, arrAux);
                            
                            if (!data3) {
                                res.json(newReponse(`Error inesperado guuardando el extra (${extras[i]})`, 'Error'));
                            }
                        }
                    }
                        
                    res.json(newReponse('pedido guardado en el carrito', 'Success'));
                }
            }
        });  
    }
}

const getCartByUserId = (req, res) => {
    const token = req.headers['x-access-token'];

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesCart.getCartByUserId, [ tokenDecoded.id ]);

                if(data.rowCount < 1) {
                    res.json(newReponse('No posee articulos en el carrito', 'Success', {}));
                    
                } else {
                    let enterprises = dataToEnterprise(data.rows);

                    for(let i = 0; i < enterprises.length; i ++) {
                        const locationData = await pool.query(dbQueriesLocation.getLocationById, [ enterprises[i].location.id ]);
                        let products = dataToProduct(enterprises[i].id , data.rows);
                        let totalCostAux = 0;

                        for(let j = 0; j < products.length; j++) {
                            const variantData = await pool.query(dbQueriesCartVariant.getCartVariantByCartId, [ products[j].cart.id ]);
                            const extraData = await pool.query(dbQueriesCartExtra.getCartExtraByCartId, [ products[j].cart.id ]);
                            let aux = 0;

                            (variantData.rowCount > 0)        
                            ? products[j].variants = dataToVariant(variantData.rows[0]) 
                            : products[j].variants = { status: true, id: 0, name: 'default' }

                            if(extraData.rowCount > 0) {        
                                products[j].extras = dataToExtra(extraData.rows);
                                products[j].extras.forEach(extra => { 
                                    if(extra.status) {
                                        aux += extra.price;
                                    }
                                });

                            }

                            products[j].cart.totalMount = (products[j].price + aux) * products[j].cart.totalUnit;
                            if(products[j].status && products[j].variants.status) {
                                totalCostAux += products[j].cart.totalMount; 
                            }
                        }

                        enterprises[i].totalCost = totalCostAux;
                        enterprises[i].products = products;

                        (locationData.rowCount < 1) 
                        ? res.json(newReponse('Error al buscar ubicaciono de negocio', 'Error'))
                        : enterprises[i].location = dataToLocation(locationData.rows[0]);
                    }
                    
                    res.json(newReponse('Acticulos encontraods', 'Success', enterprises));
                }
            }
        });  
    }
}

const deleteCartByEnnterprise = (req, res) => {
    const token = req.headers['x-access-token'];
    const { id } = req.body; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesCart.deleteCArtByEnterpriseId, [ id, tokenDecoded.id ]);

                (data)
                ? res.json(newReponse('Negocio retirado del carrito satisfactoriamente', 'Success'))
                : res.json(newReponse('Error al intentar eliminar negocio', 'Error'));
            }
        });
    }
}

const deleteCartById = (req, res) => { 
    const token = req.headers['x-access-token'];
    const { id } = req.body; 


    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesCart.deleteCArtByCartId, [ id,  tokenDecoded.id ]);

                (data)
                ? res.json(newReponse('Prducto retirado del carrito satisfactoriamente', 'Success'))
                : res.json(newReponse('Error al intentar eliminar producto', 'Error'));
            }
        });
    }
}

// Export
module.exports = { 
    createCart,
    getCartByUserId,
    deleteCartById,
    deleteCartByEnnterprise
}