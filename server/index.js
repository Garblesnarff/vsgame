// server/index.js
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('colyseus');
const { monitor } = require('@colyseus/monitor');
const { VampireGameRoom } = require('./rooms/VampireGameRoom');

const port = process.env.PORT || 2567;
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the client folder
app.use(express.static('dist'));

// Setup the Colyseus server
const gameServer = new Server({
  server: http.createServer(app)
});

// Register the room handlers
gameServer.define('vampire_game', VampireGameRoom);

// Register the Colyseus monitor (accessible at /colyseus)
app.use('/colyseus', monitor());

// Listen on the specified port
gameServer.listen(port);
console.log(`Vampire Multiplayer Game Server listening on port ${port}`);