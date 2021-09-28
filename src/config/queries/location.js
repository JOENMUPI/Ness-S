const table = 'location';

module.exports = {
    // Insert
    createLocation: `INSERT INTO ${ table } 
    (location_nam, location_des, location_lat, location_lon, state_ide, city_ide) 
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING location_ide`,    
   
    
    // Select
    getLocationById: `SELECT l.*, c.*, s.* FROM ${ table } AS l  
    JOIN city AS c ON c.city_ide = l.city_ide
    JOIN state AS s ON s.state_ide = c.state_ide
    WHERE location_ide = $1`,

    
    // Update
    updateLocationById: `UPDATE ${ table } 
    SET state_ide = $1, city_ide = $2, location_nam = $3, location_des = $4, location_lat= $5, location_lon = $6  
    WHERE location_ide = $7`,


    // Delete
    deleteLocationById: `DELETE FROM ${ table } WHERE location_ide = $1`
};