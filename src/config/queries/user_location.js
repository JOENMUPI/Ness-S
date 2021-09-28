const table = 'user_location';

module.exports = {
    // Insert
    createUserLocation: `INSERT INTO ${ table } (user_ide, location_ide) 
    VALUES ($1, $2)`,    
   
    
    // Select
    getLocationByUser: `SELECT l.*, ul.*, s.*, c.* FROM user_location AS ul 
    JOIN location AS l ON l.location_ide = ul.location_ide
    JOIN city AS c ON c.city_ide = l.city_ide
    JOIN state AS s ON s.state_ide = l.state_ide 
    WHERE ul.user_ide = $1 
    ORDER BY l.location_ide DESC`,

    
    // Update
    

    // Delete
    deleteLocationById: `DELETE FROM ${ table } WHERE (location_ide = $1 AND user_ide = $2)`
};