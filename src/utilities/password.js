const bcryt = require('bcryptjs');


// Logic
const checkPass = (pass) => {
    try {
        if(pass.length < 8) {		
            return false;
            
        } else {
            let capitalLetter = false;
            let lowercaseLetter = false;
            let number = false;
            let specialLetter = false;
            
            for(let i = 0; i < pass.length; i++) {
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
            
            return (capitalLetter && lowercaseLetter && specialLetter && number);
        }

    } catch(e) {
        console.error(e);
        return false;
    }
}

const encryptPass = async (pass, callBack) => {
    try {
        return callBack(null, await bcryt.hash(pass, 10));
    
    } catch(e) {
        console.error(e);
        return callBack(e, null);
    }
}


// Export
module.exports = {
    encryptPass,
    checkPass
}