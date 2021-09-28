module.exports = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.BD_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
    //ssl: { rejectUnauthorized: false }
};