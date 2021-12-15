require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const pg = require('pg');
const path = require('path');
const cors = require('cors');


// Initializations
const app = express();


// Settings
app.set('port', process.env.PORT || 8000);
app.set('endPoint', '/'); 


// MiddleWare
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());


// Global Var


// Routes
app.use(require('./routes/user'));
app.use(require('./routes/phone'));
app.use(require('./routes/direction'));
app.use(require('./routes/state'));
app.use(require('./routes/tag'));
app.use(require('./routes/deposit'));
app.use(require('./routes/enterprise'));
app.use(require('./routes/productTag'));
app.use(require('./routes/bank'));
app.use(require('./routes/withdraw'));
app.use(require('./routes/product'));
app.use(require('./routes/cart'));
app.use(require('./routes/bill'));

// Server Listen
app.listen(app.get('port'), () => {
    console.log('Server listening on', app.get('port'));
});