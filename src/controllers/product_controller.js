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
    
    for(let i = 0; i < variants.length; i++) { console.log('kuku2');
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
const createProduct = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { extras, variants, price, img, productTag, description, name, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
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
                console.log('hola', response);
                res.json(newReponse('Productos creado', 'Success', response));
            }

        } 
    }
}

const updateProductById = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { name, description, price, img, productTag, enterpriseId, id, status } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        let arrAux = [ tokenDecoded.id, enterpriseId ];
        let data = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);

        if(data.rowCount < 1) {
            res.json(newReponse('Usuario no valido para este negocio', 'Error'));
        
        } else {
            arrAux = [ name, description, price, img, status, productTag.id, id, enterpriseId ];
            data = await pool.query(dbQueriesProduct.updateProductById, arrAux);
    
            (!data) 
            ? res.json(newReponse('Error actualizando producto', 'Error', { }))
            : res.json(newReponse('producto actualizada', 'Success', { }));
        }
    }
}

const updatestatusByProductId = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { productId, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
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
}

// Export
module.exports = { 
    createProduct,
    updateProductById,
    updatestatusByProductId
}