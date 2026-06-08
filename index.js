const express = require('express');
require('dotenv').config();
const pool = require('./src/db/index');
const auth = require('./src/routes/auth');
const monitor = require('./src/routes/monitors');
require('./src/jobs/pingMonitors');


const app = express();
app.use(express.json());


app.use('/auth', auth);
app.use('/monitors', monitor);



app.listen(process.env.PORT, () => {
    console.log(`Sentinel running on port ${process.env.PORT}`);
})