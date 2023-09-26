const io = require('socket.io-client');

const socket = io('https://socket-server-3xoa.onrender.com');

socket.on('connect', () => {
    console.log('Connected to the WebSocket server');
    socket.emit('join', null);
});

module.exports = socket

