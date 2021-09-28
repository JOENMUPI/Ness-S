const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesLocation = require('../config/queries/location');
const dbQueriesUserLocation = require('../config/queries/user_location');
const jwt = require('jsonwebtoken');

// Variables
const pool = new Pool(dbConfig);


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToLocation = (rows) => {
    const locations = [];
        
    rows.forEach(element => { 
        let aux = {  
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

        locations.push(aux);
    });

    return locations;
}


// Logic
const getUserLocation = async (req, res) => {
    const token = req.headers['x-access-token'];

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));
    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const data = await pool.query(dbQueriesUserLocation.getLocationByUser, [ tokenDecoded.id ]);

        if(!data) {
            res.json(newReponse('Error al buscar locaciones', 'Error', { }));
        
        } else {
            (data.rowCount < 1)
            ? res.json(newReponse('No posee locaciones', 'Success', []))
            : res.json(newReponse('sus locaciones', 'Success', dataToLocation(data.rows)));
        }
    }
}

const createLocation = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { stateId, cityId, coordinate, locationDescription, locationName } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else {
        const arrAux = [ 
            locationName, 
            locationDescription, 
            coordinate.latitude, 
            coordinate.longitude, 
            stateId, 
            cityId 
        ];

        const data = await pool.query(dbQueriesLocation.createLocation, arrAux);
        
        (!data)
        ? res.json(newReponse('Error al crear locacion', 'Error', { }))
        : res.json(newReponse('Locacion registrada', 'Success', { id: data.rows[0].location_ide })); 
    }
}

const createUserLocation = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { stateId, cityId, coordinate, locationDescription, locationName } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else {
        const arrAux = [ 
            locationName, 
            locationDescription, 
            coordinate.latitude, 
            coordinate.longitude, 
            stateId, 
            cityId 
        ];

        const data = await pool.query(dbQueriesLocation.createLocation, arrAux);
        
        if(!data) {
            res.json(newReponse('Error al crear locacion', 'Error', { }));  
        
        } else {
            const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
            const arrAux2 = [ tokenDecoded.id, data.rows[0].location_ide ];
            const data2 = await pool.query(dbQueriesUserLocation.createUserLocation, arrAux2);

            (!data2)
            ? res.json(newReponse('Error al relacionar locacion con usuario', 'Error', { }))
            : res.json(newReponse('Locacion registrada', 'Success', { id: data.rows[0].location_ide })); 
        }
    }
}

const updateLocation = async (req, res) => { 
    const token = req.headers['x-access-token'];
    const { locationId, stateId, cityId, coordinate, locationDescription, locationName } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuarion sin token', 'Error', { }));

    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const aux = [ 
            stateId, 
            cityId, 
            locationName, 
            locationDescription, 
            coordinate.latitude, 
            coordinate.longitude,   
            locationId,
        ]; 

        const data = await pool.query(dbQueriesLocation.updateLocationById, aux);
        
        (data)
        ? res.json(newReponse('Locacion actualizada', 'Success', { }))
        : res.json(newReponse('Error actualizando locacion', 'Error', { }));
    }
}

const deleteUserLocation = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { directionId } = req.params;

    if(!token) {
        res.json(newReponse('Usuarion sin token', 'Error', { }));
    
    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const arrAux = [ directionId, tokenDecoded.id ]; 
        const data = await pool.query(dbQueriesUserLocation.deleteLocationById, arrAux);

        (data)
        ? res.json(newReponse('Locacion eliminada', 'Success', { }))
        : res.json(newReponse('Error eliminando locacion', 'Error', { }));
    }
}

// Export
module.exports = { 
    getUserLocation,
    createLocation,
    createUserLocation,
    updateLocation,
    deleteUserLocation
}