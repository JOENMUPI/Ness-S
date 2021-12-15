const Pool = require('pg').Pool;
const bcryt = require('bcryptjs');
const dbConfig = require('../config/db_config');
const dbQueriesUser = require('../config/queries/user');
const dbQueriesPhone = require('../config/queries/phone');
const passwordUtil = require('../utilities/password');
const jwt = require('jsonwebtoken');
const timeAgo = require('timeago.js');
const speakEasy = require('speakeasy');


// Variables
const pool = new Pool(dbConfig);  

const dobleVerificacion  = () => {
    const secret = speakEasy.generateSecret({ length: 20 }).base32;
    // se guarda en la db relacionada con el usuario la secret y se le envia al user
    // el token sool dura 30 seg 
    const aux = {
        token: speakEasy.totp({
            secret: secret,
            encoding: "base32"
        }),
    }
}

const verificacion = (token) => {
    const secret;
    // secret vienen de la db
    const valid = speakEasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        window: 0
    });

    if(valid) {
        //todo en orden
    } else {
        //caduco el tiempo del codigo
    }
}

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
const getUserById = (req, res) => { 
    const token = req.headers['x-access-token'];

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));
    
    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
                
                (!data)   
                ? res.json(newReponse('Usuario no encontrado', 'Error', { }))
                : res.json(newReponse('Usuario encontrado', 'Success', dataToUser(data.rows)[0]));
            }
        }); 
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

const getNumByUserId = (req, res) => {
    const token = req.headers['x-access-token'];
    const { userId } =  req.params;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                
                if(userId != tokenDecoded.id) {
                    res.json(newReponse('Usuario y token no coinciden', 'Error'));

                } else {
                    const data = await pool.query(dbQueriesUser.getNumByUserId, [ tokenDecoded.id, process.env.AES_KEY ]);
    
                    (data.rowCount < 1) 
                    ? res.json(newReponse('Usuario no encontrado', 'Error'))
                    : res.json(newReponse('Numero de usuario encontrado', 'Success', { phone: data.rows[0].pgp_sym_decrypt }));    
                }
            }
        });
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

const updatePass = (req, res) => {
    const token = req.headers['x-access-token'];
    const { oldPassword, newPassword } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const data = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no encontrado', 'Error')) 
                
                } else {
                    if(await bcryt.compare(oldPassword, data.rows[0].user_pas.toString())) {
                        if (await bcryt.compare(newPassword, data.rows[0].user_pas.toString())) {
                            res.json(newReponse('Clave actualizada', 'Success', { }));

                        } else {
                            let passAux;
    
                            await passwordUtil.encryptPass(newPassword, async(err, hash) => { 
                                (err)
                                ? res.json(newReponse(err, 'Error', { })) 
                                : passAux = hash;
                            });
    
                            if(!passAux) {
                                res.json(newReponse('Error interno de encriptacion', 'Error', { }));
                            
                            } else {
                                const data2 = await pool.query(dbQueriesUser.updatePassById, [ passAux, tokenDecoded.id ]);
    
                                (data2)
                                ? res.json(newReponse('Clave actualizada', 'Success', { }))
                                : res.json(newReponse('Error  actualizando la clave', 'Error', { }));
                            }
                        }

                    } else {
                        res.json(newReponse('Clave incorrecta', 'Error', { }));
                    }
                }
            } 
        });
    }
} 

const updateField = (req, res) => {
    const token = req.headers['x-access-token'];
    const { type, data } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error', { }));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let dataDB; 
                
                switch(type) {
                    case 'name':
                        dataDB = await pool.query(dbQueriesUser.updateNameById, [ data, tokenDecoded.id ]);
                        break;
                    
                    case 'email':
                        dataDB = await pool.query(dbQueriesUser.updatEmailById, [ data, tokenDecoded.id ]);
                        break;
                    
                    case 'phone':
                        let dataAux = await pool.query(dbQueriesPhone.getPhoneNumberByNum, [ data, process.env.AES_KEY ]); 
                        let phoneId; 
                    
                        if(dataAux.rowCount > 0) { 
                            phoneId = dataAux.rows[0].phone_ide; 
                        
                        } else {
                            dataAux = await pool.query(dbQueriesPhone.createPhoneNumber, [ data, process.env.AES_KEY ]); 
                            phoneId = dataAux.rows[0].phone_ide;
                        } 

                        dataDB = await pool.query(dbQueriesUser.updatePhoneIdById, [ phoneId, tokenDecoded.id ]);
                        break;
                    
                    default:
                        res.json(newReponse('Tipo de campo no valido', 'Error', { }));
                        break;
                }

                if(!dataDB) {
                    res.json(newReponse(`Error al actualizar el campo (${type})`, 'Error', { }));
                    
                } else {
                    if(type == 'name' || type == '') {
                        const userData = await pool.query(dbQueriesUser.getUserById, [ tokenDecoded.id ]);
                        let user = dataToUser(userData.rows)[0];
                        const token = jwt.sign(user, process.env.SECRET, { expiresIn: '2h' });

                        res.json(newReponse(`Campo (${type}) actualizado`, 'Success', { token, user }));
                    
                    } else {
                        res.json(newReponse(`Campo (${type}) actualizado`, 'Success'));
                    }
                }
            }
        });
    }
}

// Export
module.exports = { 
    checkEmail,
    getUserById,
    login,
    getUser, 
    createUsers, 
    updatePass,
    updateField,
    getNumByUserId,
}