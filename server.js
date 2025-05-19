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

const rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomID) => {
        socket.join(roomID);

        // Track players in the room
        if (!rooms[roomID]) rooms[roomID] = [];
        rooms[roomID].push(socket.id);

        // Assign playerId (1 or 2)
        const playerId = rooms[roomID].length;
        socket.emit('playerId', playerId);

        // If both players have joined, notify both
        if (rooms[roomID].length === 2) {
            io.to(roomID).emit('startGame');
        }

        // Clean up on disconnect
        socket.on('disconnect', () => {
            if (rooms[roomID]) {
                rooms[roomID] = rooms[roomID].filter(id => id !== socket.id);
                if (rooms[roomID].length === 0) delete rooms[roomID];
            }
        });
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