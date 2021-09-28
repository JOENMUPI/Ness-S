const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesProductTag = require('../config/queries/product_tag');
const dbQueriesAdmin = require('../config/queries/admin');
const jwt = require('jsonwebtoken');

// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

// Logic
const createProductTag = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { tagName, enterpriseId } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const arrAux = [ tokenDecoded.id, enterpriseId ];
        const adminData = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);

        if(adminData.rowCount < 1) {
            res.json(newReponse('Usuario no valido para este negocio', 'Error'));
       
        } else {
            const data = await pool.query(dbQueriesProductTag.createProductTag, [ tagName, enterpriseId ]);
    
            (!data) 
            ? res.json(newReponse('Error registrando seccion de producto', 'Error', { }))
            : res.json(newReponse('Nueva seccion creada', 'Success', { id: data.rows[0].product_tag_ide }));
        } 
    }
}

const updateProductTag = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { name, enterpriseId, id } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const arrAux = [ tokenDecoded.id, enterpriseId ];
        const adminData = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);

        if(adminData.rowCount < 1) {
            res.json(newReponse('Usuario no valido para este negocio', 'Error'));
        
        } else {
            const arrAux = [ name, id, enterpriseId ];
            const data = await pool.query(dbQueriesProductTag.updateProductTagById, arrAux);
    
            (!data) 
            ? res.json(newReponse('Error actualizando seccion de producto', 'Error', { }))
            : res.json(newReponse('seccion actualizada', 'Success', { }));
        }
    }
}

const deleteProductTag = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { enterpriseId, productTagId } = req.params;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const arrAux = [ tokenDecoded.id, enterpriseId ];
        const adminData = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);

        if(adminData.rowCount < 1) {
            res.json(newReponse('Usuario no valido para este negocio', 'Error'));
        
        } else {
            const arrAux = [ productTagId, enterpriseId ];
            const data = await pool.query(dbQueriesProductTag.deleteProductTagById, arrAux);
    
            (!data) 
            ? res.json(newReponse('Error eliminando seccion de producto', 'Error'))
            : res.json(newReponse('seccion eliminada', 'Success'));
        }
    }
}

// Export
module.exports = { 
    createProductTag,
    updateProductTag,
    deleteProductTag
}