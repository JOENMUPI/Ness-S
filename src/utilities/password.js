const bcryt = require('bcryptjs');


// Logic
const checkPass = (pass) => {
    if(pass.length >= 8) {		
        let capitalLetter = false;
        let lowercaseLetter = false;
        let number = false;
        let specialLetter = false;
        
        for(var i = 0; i < pass.length; i++) {
            if(pass.charCodeAt(i) > 64 && pass.charCodeAt(i) < 91) {
                capitalLetter = true;
            
            } else if(pass.charCodeAt(i) > 96 && pass.charCodeAt(i) < 123) {
                lowercaseLetter = true;
            
            } else if(pass.charCodeAt(i) > 47 && pass.charCodeAt(i) < 58) {
                number = true;
            
            } else {
                specialLetter = true;
            }

        }
        
        if(capitalLetter && lowercaseLetter && specialLetter && number) {
            return true;
        
        } else {
            return false;
        }
    }
}

const encryptPass = async (pass, callBack) => {
    const salt = await bcryt.genSalt(10);
    
    if(salt) {
        const hash = await bcryt.hash(pass, salt);

        if(hash) {
            return callBack(null, hash);
        
        } else {
            return callBack('Error on hash');    
        }
    
    } else {
        return callBack('Error on salt');
    }
}


// Export
module.exports = {
    encryptPass,
    checkPass
}