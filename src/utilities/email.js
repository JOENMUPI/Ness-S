// Logic
const checkEmail = (email) => {
    try {
        return !/^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i.test(email);

    } catch(e) {
        console.error(e);
        return false;
    }
}


// Export
module.exports = {
    checkEmail
}
