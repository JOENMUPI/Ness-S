const table = 'tag';

module.exports = {
    // Insert
    
    
    // Select
    getTags: `SELECT * FROM ${ table }`,
    getTagById: `SELECT * FROM ${ table } WHERE tag_ide = $1`,
    
    
    // Update

    
    // Delete
};