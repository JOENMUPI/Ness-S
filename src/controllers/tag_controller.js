const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesTag = require('../config/queries/tag');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToTag = (rows) => {  
    const tags = []; 
        
    rows.forEach(element => { 
        let aux = {  
            id: element.tag_ide,
            name: element.tag_des
        }

        tags.push(aux);
    }); 

    return tags;
}


// Logic
const getTags = async (req, res) => {
    const allTags = await pool.query(dbQueriesTag.getTags);
    
    (allTags.rowCount < 1) 
    ? res.json(newReponse('Tags no econtrados', 'Success', []))
    : res.json(newReponse('Tags encontrados', 'Success', dataToTag(allTags.rows)));
    
}


// Export
module.exports = { 
    getTags
}