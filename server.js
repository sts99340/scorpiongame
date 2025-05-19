const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});
app.get('/game.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

io.on('connection', (socket) => {
    // Join a room
    socket.on('joinRoom', (roomID) => {
        socket.join(roomID);
        // Optionally, send back player number (1 or 2)
        const clients = io.sockets.adapter.rooms.get(roomID);
        const playerId = clients.size;
        socket.emit('playerId', playerId);
        // Notify others in the room if needed
    });

    // Relay events only to others in the same room
    socket.on('playerMove', (data) => {
        socket.to(data.roomID).emit('playerMove', data);
    });
    socket.on('wave', (data) => {
        socket.to(data.roomID).emit('wave', data);
    });
    socket.on('bullet', (data) => {
        socket.to(data.roomID).emit('bullet', data);
    });
    socket.on('ballUpdate', (data) => {
        socket.to(data.roomID).emit('ballUpdate', data);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});