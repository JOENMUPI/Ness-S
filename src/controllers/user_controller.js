const Pool = require('pg').Pool;
const bcryt = require('bcryptjs');
const dbConfig = require('../config/db_config');
//const twilioConfig = require('../config/twilio_config');
//const twilioClient = require('twilio')(twilioConfig.sid, twilioConfig.token)
const dbQueriesUser = require('../config/queries/user');
const passwordUtil = require('../utilities/password');
const jwt = require('jsonwebtoken');
const timeAgo = require('timeago.js');


// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToUser = (rows) => {
    const users = [];
        
    rows.forEach(element => {
        let user = {  
            balance: element.user_bal,
            phoneId: element.phone_ide,
            name: element.user_nam,
            email: element.user_ema,
            id: element.user_ide
        }
         
        users.push(user);
    });
    
    return users;
}

const checkEmail = async (req, res) => {
    const { email } = req.body; 
    const data = await pool.query(dbQueriesUser.getUserByEmail, [ email.toLowerCase() ]);
    
    (data.rowCount > 0) 
    ? res.json(newReponse(`Email ${ email } ya esta en uso`, 'Error', { }))
    : res.json(newReponse('Email comprobado', 'Success', { }));
}


// Logic
const getUserById = async (req, res) => { 
    const token = req.headers['x-access-token'];

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }))
    
    } else {
        const { iat, exp, ...tokenDecoded } = jwt.verify(token, process.env.SECRET); 
        const data = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
        
        (!data)   
        ? res.json(newReponse('Usuario no encontrado', 'Error', { }))
        : res.json(newReponse('Usuario encontrado', 'Success', dataToUser(data.rows)[0]));
    }
}

const login = async (req, res) => { 
    const { email, password } = req.body;  
    const data = await pool.query(dbQueriesUser.getUserByEmail, [ email.toLowerCase() ]);
    
    if(data.rowCount > 0) {  
        let user  = dataToUser(data.rows)[0];
        const token = jwt.sign(user, process.env.SECRET, { expiresIn: '2h' }); 
        
        (await bcryt.compare(password, data.rows[0].user_pas.toString())) 
        ? res.json(newReponse('Logeado', 'Success', { token, user }))
        : res.json(newReponse('Clave incorrecta', 'Error', { }));
    
    } else {
        res.json(newReponse('Email no encontrado', 'Error', { })); 
    }    
}

const getUser = async (req, res) => { 
    const data = await pool.query(dbQueriesUser.getAllUsers);
    
    if (data) {
        (data.rowCount > 0)
        ? res.json(newReponse('Usuarios', 'Success', dataToUser(data.rows)))
        : res.json(newReponse('No hay usuarios en el sistema', 'Error', { }));
    
    } else { 
        res.json(newReponse('Without users', 'Success', { }));
    }
}

const createUsers = async (req, res) => {   
    const { name, password, email, phoneNumberId } = req.body;
    let passAux;

    await passwordUtil.encryptPass(password, async(err, hash) => { 
        (err)
        ? res.json(newReponse(err, 'Error', { })) 
        : passAux = hash;
    });

    

    if(passAux) {
        const arrAux = [ name, email, passAux, phoneNumberId ];
        const data = await pool.query(dbQueriesUser.createUser, arrAux);
        
        (data)
        ? res.json(newReponse('Usuario creado', 'Success', { }))
        : res.json(newReponse('Error al crear el usuario', 'Error', { }));

    } else { 
        res.json(newReponse('Error interno de encriptacion', 'Error', { }));
    }
}


// Export
module.exports = { 
    checkEmail,
    getUserById,
    login,
    getUser, 
    createUsers, 
}