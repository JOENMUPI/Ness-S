const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesState = require('../config/queries/state');
const dbQueriesCity = require('../config/queries/city');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToState = (data, cities) => {  
    const state = {  
        id: data.state_ide,
        name: data.state_nam,
        cities
    }
         
    return state;
}

const getAllCities = async (stateId) => {
    const allcities = await pool.query(dbQueriesCity.getcitiesByState, [ stateId ]);
    let allstatesAux = [];

    if (allcities) {
        allcities.rows.forEach(cities => {
            const aux = {  
                id: cities.city_ide,
                name: cities.city_nam,
                coordinate: {
                    latitude: cities.city_lat,
                    longitude: cities.city_lon,
                }
            }

            allstatesAux.push(aux);
        });
    } 

    return allstatesAux;
}

// Logic
const getStates = async (req, res) => {
    const allStates = await pool.query(dbQueriesState.getStates);
    let allstatesAux = [];

    if (!allStates) {
        res.json(newReponse('Estados no econtrados', 'Error', { }));
    
    } else {
        for(let i = 0; i < allStates.rowCount; i++) {
            const aux = dataToState(allStates.rows[i], await getAllCities(allStates.rows[i].state_ide));
            allstatesAux.push(aux);
        }

        res.json(newReponse('Estados en linea', 'Success', allstatesAux));
    }

    return allstatesAux;
}


// Export
module.exports = { 
    getStates
}