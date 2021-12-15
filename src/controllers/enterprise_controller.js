const Pool = require('pg').Pool;
const dbConfig = require('../config/db_config');
const dbQueriesAdmin = require('../config/queries/admin');
const dbQueriesLocation = require('../config/queries/location');
const dbQueriesEnterprise = require('../config/queries/enterprise');
const dbQueriesEnterpriseTag = require('../config/queries/enterprise_tag');
const dbQueriesProductTag = require('../config/queries/product_tag');
const dbQueriesEnterprisePhone = require('../config/queries/enterprise_phone');
const dbQueriesEnterpriseBank = require('../config/queries/enterprise_bank');
const dbQueriesProduct = require('../config/queries/product');
const dbQueriesVariant = require('../config/queries/variant');
const dbQueriesExtra = require('../config/queries/extra');
const dbQueriesBill = require('../config/queries/bill');
const jwt = require('jsonwebtoken');

// Variables
const pool = new Pool(dbConfig);  


// Utilities
const newReponse = (message, typeResponse, body) => {
    return {  message, typeResponse, body }
}

const dataToEnterprise = (rows) => {
    const companies = [];
        
    rows.forEach(element => { 
        let aux = {  
            img: element.enterprise_img,
            hourDay: element.enterprise_day_ope_jso,
            name: element.enterprise_nam,
            balance: element.enterprise_bal,
            status: element.enterprise_sta,
            id: element.enterprise_ide,
            phones: [],
            tags: [],
            banks: [],
            products: [],
            productTag: [],
            location: {}
        }

        if(aux.img != null) {
            aux.img = aux.img.toString();
        }

        companies.push(aux);
    });

    return companies;
}

const dataToPhone = (rows) => {
    const phones = [];
        
    rows.forEach(element => { 
        let aux = { 
            phoneCode: element.phone_cod,
            phoneNum: element.pgp_sym_decrypt,
            phoneId: element.phone_ide 
        }

        phones.push(aux);
    }); 

    return phones;
}

const dataTotag = (rows) => { 
    const tags = [];
        
    rows.forEach(element => { 
        let aux = { 
            name: element.tag_des,
            id: element.tag_ide 
        }

        tags.push(aux);
    }); 

    return tags;
}

const dataToProductTag = (rows) => {
    const tags = [];
        
    rows.forEach(element => { 
        let aux = { 
            name: element.product_tag_des,
            id: element.product_tag_ide 
        }

        tags.push(aux);
    });

    return tags;
}

const dataToBanks = (rows) => {
    const banks = [];
        
    rows.forEach(element => { 
        let aux = { 
            countNum: element.pgp_sym_decrypt,
            titularName: element.count_bank_tit,
            titularId: element.count_bank_tit_ide,
            countBankId: element.count_bank_ide,
            bankName: element.bank_des,
            bankId: element.bank_ide
        }

        banks.push(aux);
    });

    return banks;
}

const dataToSell = (rows) => {
    const response = [];
        
    rows.forEach(element => { 
        let aux = { 
            user: {
                name: element.user_nam,
            },

            bill: {
                id: element.bill_ide,
                mount: element.bill_mou,
                status: element.bill_sta,
                date: element.bill_dat_cre,
                products: element.bill_data_jso.data,
            },

            location: {
                cityId: element.city_ide,
                stateId: element.state_ide,
                locationId: element.location_ide,
                locationDescription: element.location_des,
                locationName: element.location_nam,
                cityName: element.city_nam,
                stateName: element.state_nam,
                coordinate: {
                    latitude: element.location_lat,
                    longitude: element.location_lon
                }
            }
        }

        response.push(aux);
    });

    return response;
}

const dataToLocation = (element) => {
    return {  
        cityId: element.city_ide,
        stateId: element.state_ide,
        locationId: element.location_ide,
        locationDescription: element.location_des,
        locationName: element.location_nam,
        cityName: element.city_nam,
        stateName: element.state_nam,
        coordinate: {
            latitude: element.location_lat,
            longitude: element.location_lon
        }
    }       
}

const dataToProduct = (element, extras, variants) => {
    const aux = {
        img: element.product_img,
        name: element.product_nam,
        description: element.product_des,
        id: element.product_ide,
        price: element.product_pri,
        status: element.product_sta,
        extras,
        variants,
        productTag: {
            id: element.product_tag_ide,
            name: element.product_tag_des
        }
    }

    if(aux.img != null) {
        aux.img = aux.img.toString();
    }

    return aux;
}

const generateCode = () => {
    let char = 'abcdefghijkmnpqrtuvwxyzABCDEFGHJKMNPQRTUVWXYZ2346789';
    let pass = ''; 
    for (let i = 0; i < 10; i++) {
        pass += char.charAt(Math.floor(Math.random() * char.length)); 
    } 
    
    return pass;
}

const getExrasByProductId =  async (productId) => {
    let response = []
    const data = await pool.query(dbQueriesExtra.getExtraByProductId, [ productId ]);
    
    if(data) {
        data.rows.forEach(element => {
            const aux = {
                name: element.extra_nam,
                id: element.extra_ide,
                price: element.extra_pri,
                status: element.extra_sta
            }
    
            response.push(aux);
        });
    } 
    
    return response;
}

const getVariantsByProductId =  async (productId) => {
    const data = await pool.query(dbQueriesVariant.getVariantByProductId, [ productId ]);
    let response = []
    
    if(data) {
        data.rows.forEach(element => {
            const aux = {
                name: element.variant_nam,
                id: element.variant_ide,
                status: element.variant_sta
            }
    
            response.push(aux);
        });
    } 
    
    return response;
}

const getProductByEnterpriseId = async (enterpriseId) => { 
    const data = await pool.query(dbQueriesProduct.getProductByEnterpriseId, enterpriseId);
    let response = []

    if(data) {
        for(let i = 0; i < data.rowCount; i++) { 
            const variants = await getVariantsByProductId(data.rows[i].product_ide); 
            const extras = await getExrasByProductId(data.rows[i].product_ide);

            response.push(dataToProduct(data.rows[i], extras, variants));
        }
    }

    return response;
}

const authCode = async(userId) => {
    let flag = true;
    let code = '';
    
    do { 
        code = generateCode();
        const arrAux = [ userId, code, process.env.AES_KEY ];
        const data = await pool.query(dbQueriesAdmin.getEnterpriseIdByuserIdAndCode, arrAux);

        (data.rowCount > 0)
        ? flag = true
        : flag = false;

    } while(flag); 

    return code;
}

const op = async (data, data2) => {
    const arraux = [ data.rows[0].enterprise_ide, process.env.AES_KEY ];
    const EnterpriseId = [ data.rows[0].enterprise_ide ];
    const locationId = [ data2.rows[0].location_ide ]; 
    let phoneData = await pool.query(dbQueriesEnterprisePhone.getPhoneByEnterpriseId, arraux);
    let tagData = await pool.query(dbQueriesEnterpriseTag.getTagByEnterpriseId, EnterpriseId);
    let locationData = await pool.query(dbQueriesLocation.getLocationById, locationId);
    let productTagData = await pool.query(dbQueriesProductTag.getProductTagByEnterpriseId, EnterpriseId);
    let banksData = await pool.query(dbQueriesEnterpriseBank.getCountBankByEnterpriseId, arraux);
    
    (banksData.rowCount > 0)  
    ? banksData = dataToBanks(banksData.rows)
    : banksData = []; 

    (productTagData.rowCount > 0)  
    ? productTagData = dataToProductTag(productTagData.rows)
    : productTagData = []; 

    (locationData.rowCount > 0)  
    ? locationData = dataToLocation(locationData.rows[0])
    : locationData = [];

    (phoneData.rowCount > 0) 
    ? phoneData = dataToPhone(phoneData.rows)
    : phoneData = []; 

    (tagData.rowCount > 0)
    ? tagData = dataTotag(tagData.rows)
    : tagData = []; 

    resonse = dataToEnterprise(data2.rows)[0];
    resonse.products = await getProductByEnterpriseId(EnterpriseId);
    resonse.phones = phoneData; 
    resonse.tags = tagData; 
    resonse.productTag = productTagData;
    resonse.location = locationData; 
    resonse.banks = banksData; 

    return resonse;
} 

// Logic
const SearchEnterprise = (req, res) => {
    const token = req.headers['x-access-token'];
    const { search } = req.params; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {  
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const arrAux = [ `%${search.toUpperCase()}%` ];
                const data = await pool.query(dbQueriesEnterprise.searchEnterpriseByName, arrAux);
                    
                (data.rowCount < 1)
                ? res.json(newReponse(`No se encontro ningun negocio con '${search}'`, 'Success', []))
                : res.json(newReponse('Negocios econtrados', 'Success', dataToEnterprise(data.rows)));
            }
        });
    }
}

const refreshEnterprise = (req, res) => {
    const token = req.headers['x-access-token'];
    const { enterpriseId } = req.params; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {  
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const arrAux = [ tokenDecoded.id, enterpriseId ];
                const data = await pool.query(dbQueriesAdmin.checkAdmin, arrAux);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para el negocio', 'Error')) 
                
                } else {
                    const arrAux2 = [ data.rows[0].enterprise_ide ];
                    const data2 = await pool.query(dbQueriesEnterprise.getEnterpriseById, arrAux2);
                    
                    (!data2)
                    ? res.json(newReponse('Error tomando data de empresa', 'Error'))
                    : res.json(newReponse('Negocio localizado', 'Success', await op(data, data2)));
                }

            } 
        });
    }
}

const getEnterprisesBytagId = async (req, res) => {
    const { tagId } = req.params;
    const data = await pool.query(dbQueriesEnterpriseTag.getEnterpriseByTagId, [ tagId ]);

    (data.rowCount < 1)
    ? res.json(newReponse('Tag sin empresas registradas', 'Success', []))
    : res.json(newReponse('Empresas encontradas', 'Success', dataToEnterprise(data.rows)));
}

const getSellByEnterpriseId = (req, res) => {
    const token = req.headers['x-access-token'];
    const { enterpriseId } = req.params;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let data = await pool.query(dbQueriesAdmin.checkAdmin, [ tokenDecoded.id, enterpriseId ]);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    data = await pool.query(dbQueriesEnterprise.getSellByenterpriseId, [ enterpriseId ]);

                    !(data.rowCount)
                    ? res.json(newReponse('No hay pedidos', 'Success', []))
                    : res.json(newReponse('Pedidos encontrados', 'Success', dataToSell(data.rows)));
                }
            }
        });
    }
}

const checkCode = (req, res) => { 
    const token = req.headers['x-access-token'];
    const { code } = req.body; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                const arrAux = [ tokenDecoded.id, code, process.env.AES_KEY ];
                const data = await pool.query(dbQueriesAdmin.getEnterpriseIdByuserIdAndCode, arrAux);
                
                if(data.rowCount < 1) {
                    res.json(newReponse('Combinacion usuario/codigo no valido para ningun negocio', 'Error'));
                
                } else { 
                    const arrAux2 = [ data.rows[0].enterprise_ide ];
                    const data2 = await pool.query(dbQueriesEnterprise.getEnterpriseById, arrAux2);
        
                    (!data2) 
                    ? res.json(newReponse('Error tomando data de empresa', 'Error')) 
                    : res.json(newReponse('Combinacion usuario/codigo valido', 'Success', await op(data, data2)));
                }
            }
        }); 
    }
}

const createEnterprise = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { name, img, location, tag, document, operationalDays } = req.body; 

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));
    
    } else {
        const arrAux1 = [ 
            location.locationName, 
            location.locationDescription, 
            location.coordinate.latitude, 
            location.coordinate.longitude, 
            location.stateId, 
            location.cityId 
        ];

        const data1 = await pool.query(dbQueriesLocation.createLocation, arrAux1);
        
        if(data1.rowCount > 0) {
            const arrAux2 = [ name, img, { document }, operationalDays, data1.rows[0].location_ide ];
            const data2 = await pool.query(dbQueriesEnterprise.createEnterprise, arrAux2);

            if(data2.rowCount > 0) {
                jwt.verify(token, process.env.SECRET, async (err, decoded) => {
                    if(err) {
                        res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
                    
                    } else {
                        const { iat, exp, ...tokenDecoded } = decoded;
                        let code = await authCode(tokenDecoded.id);
                        const arrAux3 = [ tokenDecoded.id, data2.rows[0].enterprise_ide, code, process.env.AES_KEY ];
                        const data3 = await pool.query(dbQueriesAdmin.createAdmin, arrAux3);
        
        
                        for(let i = 0; i < tag.length; i++) {
                            const  arrAux4 = [ data2.rows[0].enterprise_ide, tag[i].id ];
                            const data4 = await pool.query(dbQueriesEnterpriseTag.createTagEnterprise, arrAux4);
                        }
        
                        if(data3.rowCount > 0) {
                            res.json(newReponse('Peticion registrada', 'Success', { code }));
                        }
                    }
                }); 
            }
        } 
    }
}

const tesis = (req, res) => {
    const token = req.headers['x-access-token'];
    const { billId, enterpriseId, mount } = req.body;

    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let data = await pool.query(dbQueriesAdmin.checkAdmin, [ tokenDecoded.id, enterpriseId ]);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    data = await pool.query(dbQueriesEnterprise.getEnterpriseById, [ enterpriseId ]);
                    
                    if(!data) {
                        res.json(newReponse('Error al buscar negocio', 'Error'));

                    } else {
                        const arrAux = [ data.rows[0].enterprise_bal + mount, enterpriseId ];
                        data = await pool.query(dbQueriesEnterprise.updateBalanceById, arrAux);
                        data = await pool.query(dbQueriesBill.updateStatusById, [ true, billId ]); 

                        
                        (!data) 
                        ? res.json(newReponse('Error al actualizar', 'Error'))
                        : res.json(newReponse('Pedido prosesado', 'Success'));
                    }
                }
            }
        });
    }
}

const updateHourDayByEnterpriseId = async (req, res) => {
    const token = req.headers['x-access-token'];
    const { closeHour, openHour, days, enterpriseId } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let data = await pool.query(dbQueriesAdmin.checkAdmin, [ tokenDecoded.id, enterpriseId ]);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    const arrAux = [ { closeHour, openHour, days }, enterpriseId ];
                    data = await pool.query(dbQueriesEnterprise.updateHourDaysById, arrAux);
        
                    (!data) 
                    ? res.json(newReponse('Error al actualizar horarios', 'Error'))
                    : res.json(newReponse('Horarios actualizados', 'Success'));
                }
            }
        });
    }
}

const updateImgByEnterpriseId = (req, res) => {
    const token = req.headers['x-access-token'];
    const { img, enterpriseId } = req.body;
    
    if(!token) {
        res.json(newReponse('Usuario sin token', 'Error'));

    } else {
        jwt.verify(token, process.env.SECRET, async (err, decoded) => {
            if(err) {
                res.json(newReponse('Token expirado, vuelva a loguear', 'Error'));
            
            } else {
                const { iat, exp, ...tokenDecoded } = decoded;
                let data = await pool.query(dbQueriesAdmin.checkAdmin, [ tokenDecoded.id, enterpriseId ]);
        
                if(data.rowCount < 1) {
                    res.json(newReponse('Usuario no valido para este negocio', 'Error'));
                
                } else {
                    data = await pool.query(dbQueriesEnterprise.updateImgById, [ img, enterpriseId ]);
        
                    (!data) 
                    ? res.json(newReponse('Error al actualizar imagen', 'Error'))
                    : res.json(newReponse('Imagen actualizados', 'Success'));
                }
            }
        });
    }
}

// Export
module.exports = { 
    checkCode,
    refreshEnterprise,
    createEnterprise,
    updateImgByEnterpriseId,
    updateHourDayByEnterpriseId,
    getEnterprisesBytagId,
    SearchEnterprise,
    getSellByEnterpriseId,
    tesis
}