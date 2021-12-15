const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesProduct = require('../config/queries/product');
const dbQueriesVariant = require('../config/queries/variant');
const dbQueriesExtra = require('../config/queries/extra');
const dbQueriesAdmin = require('../config/queries/admin');
const jwt = require('jsonwebtoken');

// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToProduct = (rows) => { 
    const products = [];

    rows.forEach(element => {
        const aux = {
            img: element.product_img,
            name: element.product_nam,
            description: element.product_des,
            id: element.product_ide,
            price: element.product_pri,
            status: element.product_sta,
            extras: [],
            variants: [],
            productTag: {
                id: element.product_tag_ide,
                name: element.product_tag_des
            }
        }

        if(aux.img != null) {
            aux.img = aux.img.toString();
        }

        products.push(aux);
    });

    return products;
}

const dataToVariant = (rows) => {
    const varinats = [];

    rows.forEach(element => {
        const aux = {
            name: element.variant_nam,
            id: element.varinat_ide,
            status: element.variant_sta
        }

        varinats.push(aux);
    });

    return varinats;
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

const checkEnterprise = (enterprise, obj) => {

} 

const insertExtrasByProductId = async (extras, productId) => { 
    let response = extras;
    
    for(let i = 0; i < extras.length; i++) {
        const arrAux = [ extras[i].name, extras[i].price, productId ]
        const data = await pool.query(dbQueriesExtra.createExtra, arrAux);

        if(!data) {
            return []
        
        } else {
            response[i] = { ...extras[i], id: data.rows[0].extra_ide, status: true }
        }
    }
    
    return response;
}

const insertVariantByProductId = async (variants, productId) => {
    let response = variants;
    
    for(let i = 0; i < variants.length; i++) { 
        const arrAux = [ variants[i].name, productId ]
        const data = await pool.query(dbQueriesVariant.createVariant, arrAux);

        if(!data) {
            return []
        } else {
            response[i] = { ...variants[i], id: data.rows[0].variant_ide, status: true }
        }
    }

    return response;
}

// Logic
const searchProductByName = (req, res) => {
    const token = req.headers['x-access-token'];
    const { search } = req.params;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const arrAux = [ `%${search.toUpperCase()}%` ];
                const data = await pool.query(dbQueriesProduct.searchProductByName, arrAux);

                (data.rowCount < 1)
                ? res.json(newReponse(`No se ha encontrado productos con '${search}'`, 'Success'))
                : res.json(newReponse('Productos encontrados', 'Success', dataToSearch(data.rows))); 
            }
        });
    }
}

const createProduct = (req, res) => {
    const token = req.headers['x-access-token'];
    const { extras, variants, price, img, productTag, description, name, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let arrAux = [ tokenDecoded.id, enterpriseId ];
                const adminData = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);
                
                if(adminData.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
               
                } else {
                    arrAux = [ name, description, price, img, productTag.id, enterpriseId ];
                    let data = await pool.query(dbQueriesProduct.createProduct, arrAux);
            
                    if(!data) {
                        res.json(newReponse('Error registrando producto', 'Error'));
        
                    } else {
                        let response = dataToProduct(data.rows)[0];
                        
                        response.productTag.name = productTag.name;
                        response.variants = await insertVariantByProductId(variants, response.id);
                        response.extras = await insertExtrasByProductId(extras, response.id);
                        res.json(newReponse('Productos creado', 'Success', response));
                    }
                } 
            }
        }); 
    }
}

const updateProductById = (req, res) => {  
    const token = req.headers['x-access-token'];
    const { name, description, price, img, productTag, enterpriseId, id, status, variants, extras } = req.body; 

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
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    arrAux = [ name, description, price, img, status, productTag.id, id, enterpriseId ];
                    data = await pool.query(dbQueriesProduct.updateProductById, arrAux);
                    let response = req.body;
                    
                    await pool.query(dbQueriesVariant.variantsOffByProductId, [ false, id ]);
                    await pool.query(dbQueriesExtra.extrasOffByProductId, [ false, id ]);
                    
                    for(let i = 0; i < variants.length; i++) {
                        let aux = [ variants[i].name, id ];
                        
                        if (variants[i].id != 0) {
                            aux = [ variants[i].name, variants[i].status, variants[i].id, id ];
                            await pool.query(dbQueriesVariant.varinatOffById, [ true, variants[i].id, id ]);
                            await pool.query(dbQueriesVariant.updateVarinatById, aux);
                         
                        } else {
                            const variantData = await pool.query(dbQueriesVariant.createVariant, aux);
                            
                            response.variants[i].id = variantData.rows[0].variant_ide;    
                        }
                    }
        
                    for(let i = 0; i < extras.length; i++) {
                        let aux = [ extras[i].name, extras[i].price, id ];
                        
                        if (extras[i].id != 0) {
                            aux = [ extras[i].name, extras[i].price, extras[i].status, extras[i].id, id ];
                            await pool.query(dbQueriesExtra.extraOffById, [ true, extras[i].id, id ]);
                            await pool.query(dbQueriesExtra.updateExtraById, aux);
                            
                        } else {
                            const extraData = await pool.query(dbQueriesExtra.createExtra, aux);
        
                            response.extras[i].id = extraData.rows.extra_ide;
                        }
                    }
        
                    arrAux = [ name, description, price, img, status, productTag.id, id, enterpriseId ];
                    data = await pool.query(dbQueriesProduct.updateProductById, arrAux);
             
                    (!data) 
                    ? res.json(newReponse('Error actualizando producto', 'Error', { }))
                    : res.json(newReponse('producto actualizada', 'Success', response));
                }
            }
        }); 
    }
}

const updatestatusByProductId = (req, res) => {
    const token = req.headers['x-access-token'];
    const { productId, enterpriseId } = req.body;

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
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    arrAux = [ productId, enterpriseId ];
                    data = await pool.query(dbQueriesProduct.productOffById, arrAux);
            
                    (!data) 
                    ? res.json(newReponse('Error actualizando estado de producto', 'Error'))
                    : res.json(newReponse('Estado del producto actualizada', 'Success'));
                }
            }
        }); 
    }
}

// Export
module.exports = { 
    createProduct,
    updateProductById,
    updatestatusByProductId
}