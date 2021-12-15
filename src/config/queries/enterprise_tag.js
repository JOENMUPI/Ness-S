const table = 'enterprise_tag';

module.exports = {
    // Insert
    createTagEnterprise: `INSERT INTO ${ table } (enterprise_ide, tag_ide) VALUES ($1, $2)`,    
   
    
    // Select   
    getTagByEnterpriseId: `SELECT t.* FROM ${ table } AS et
    JOIN tag As t ON t.tag_ide = et.tag_ide 
    WHERE et.enterprise_ide = $1`,
    getEnterpriseByTagId: `SELECT e.* FROM ${ table } AS et
    JOIN enterprise AS e ON e.enterprise_ide = et.enterprise_ide 
    WHERE et.tag_ide = $1`
    
    // Update
    

    // Delete
    
};