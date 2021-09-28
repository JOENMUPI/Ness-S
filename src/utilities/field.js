// Logic
const checkFields = (fields) => {
    try {
        let flag = true;

        fields.forEach((Element) => {
            if(Element.length <= 0) {
                flag = false;
            }
        });

        return flag; 
    
    } catch(e) {
        return false;
    }
}


// Export
module.exports = {
    checkFields
}