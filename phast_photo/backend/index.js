require('dotenv').config();
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes/router')
const mongoose = require('mongoose')
const photo = require('./models/photo')

const app = express()

mongoose.connect(process.env.dbURI)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credential: true,
    optionSuccessStatus: 200

}

app.use(cors(corsOptions))
app.use('/', router)

const port = 4000
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})