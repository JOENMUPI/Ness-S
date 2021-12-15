// Logic
const checkFields = (fields) => {
    try {
        let flag = true;

        fields.forEach((Element) => {
            if(Element.length < 1) {
                flag = false;
            }
        });

        return flag; 
    
    } catch(e) {
        console.error(e);
        return false;
    }
}


// Export
module.exports = {
    checkFields
}