require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socketIo = require('socket.io'); // Import socket.io module
const http = require('http');

const router = require('./routes/router');
const photo = require('./models/photo');

const app = express();
const server = http.createServer(app); // Create HTTP server

mongoose.connect(process.env.dbURI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use('/', router);

const port = 4000;

// Initialize socket.io on the HTTP server
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A client connected');
    // You can add socket event handlers here if needed
});

// Start the HTTP server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
