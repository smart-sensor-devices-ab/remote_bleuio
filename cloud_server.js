const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ioClient = require('socket.io-client'); // Client for local serial server

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to the local serial server via WebSocket
const LOCAL_SERVER_URL = 'https://real-poets-count.loca.lt';
const localSocket = ioClient(LOCAL_SERVER_URL);

// Serve static files (frontend files for Page 1 and Page 2)
app.use(express.static('public'));

// Handle messages from Page 2 and forward to local serial server
io.on('connection', (socket) => {
  console.log('Client connected to cloud server');

  // Receive command from Page 2 and forward to local serial server
  socket.on('sendCommand', (command) => {
    console.log(`Forwarding command to local server: ${command}`);
    localSocket.emit('sendCommand', command); // Send to local serial server
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from cloud server');
  });
});

// Receive data from local serial server and forward to clients
localSocket.on('serialResponse', (data) => {
  console.log(`Received data from local serial server: ${data}`);
  io.emit('serialResponse', data); // Broadcast to connected clients
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Cloud server is running on http://localhost:${PORT}`);
});
