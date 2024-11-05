const http = require('http');
const { SerialPort } = require('serialport');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server);

// Define the serial port path and baud rate
const portPath = 'COM592'; // Replace 'COM3' with your dongle's port
const serialPort = new SerialPort({ path: portPath, baudRate: 9600 });

// Listen for incoming connections from the cloud server
io.on('connection', (socket) => {
  console.log('Connected to cloud server');

  // Receive command from cloud and send to serial port
  socket.on('sendCommand', (command) => {
    const formattedCommand = `${command}\r\n`;
    console.log(`Sending command to serial port: ${formattedCommand}`);
    serialPort.write(formattedCommand);
  });

  // Send serial responses to cloud server
  serialPort.on('data', (data) => {
    console.log(`Data received from serial port: ${data}`);
    socket.emit('serialResponse', data.toString());
  });
});

// Start the server on a specified port
const LOCAL_PORT = 4000; // Choose any port, ensure firewall allows it
server.listen(LOCAL_PORT, () => {
  console.log(`Local Serial Server running on http://localhost:${LOCAL_PORT}`);
});
