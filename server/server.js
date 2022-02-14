require('./config/config')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// parse application/json
app.use(bodyParser.json({ limit: '10mb' }));

//Configuracion Global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useCreateIndex: true
    },
    (err, resp) => {
        if (err) throw err;
        console.log("Database ONLINE");
    });

app.listen(process.env.PORT, () => { console.log(`Listening in the port ${process.env.PORT}`) })