const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (frontend files for Page 1 and Page 2)
app.use(express.static('public'));

// Setup the serial port (adjust the port path and baud rate as needed)
const portPath = '/dev/cu.usbmodem4048FDE52CF21'; // Update this path to your serial port
const serialPort = new SerialPort({ path: portPath, baudRate: 9600 });

// Handle serial data and send it back to Page 2
serialPort.on('data', (data) => {
  console.log(`Received data from serial port: ${data}`);
  io.emit('serialResponse', data.toString()); // Send data back to Page 2
});

io.on('connection', (socket) => {
  console.log('Client connected');

  // Listen for commands from Page 2
  socket.on('sendCommand', (command) => {
    const formattedCommand = `${command}\r\n`; // Add \r\n to the command
    console.log(`Formatted Command sent to serial port: ${formattedCommand}`);
    serialPort.write(formattedCommand); // Send formatted command to serial port
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
