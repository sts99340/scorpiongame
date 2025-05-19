const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path'); // Import path module

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Serve the HTML file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html')); // Serve game.html
});

let playerCount = 0;
const playerSockets = {};

// Handle WebSocket connections
io.on('connection', (socket) => {
    playerCount++;
    const playerId = playerCount <= 2 ? playerCount : null;
    if (playerId) {
        playerSockets[playerId] = socket;
        socket.emit('playerId', playerId);
        console.log(`Assigned Player ${playerId} to socket ${socket.id}`);
    } else {
        socket.emit('full');
        socket.disconnect();
        return;
    }

    // Relay player movement to the other player
    socket.on('playerMove', (data) => {
        // data: { player, x, y }
        // Send to the other player only
        Object.entries(playerSockets).forEach(([id, s]) => {
            if (s !== socket) {
                s.emit('playerMove', data);
            }
        });
    });

    // Relay wave event
    socket.on('wave', (data) => {
        Object.entries(playerSockets).forEach(([id, s]) => {
            if (s !== socket) {
                s.emit('wave', data);
            }
        });
    });

    // Relay bullet event
    socket.on('bullet', (data) => {
        Object.entries(playerSockets).forEach(([id, s]) => {
            if (s !== socket) {
                s.emit('bullet', data);
            }
        });
    });

    // Relay ball updates
    socket.on('ballUpdate', (data) => {
        Object.entries(playerSockets).forEach(([id, s]) => {
            if (s !== socket) {
                s.emit('ballUpdate', data);
            }
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player ${playerId} disconnected`);
        delete playerSockets[playerId];
        playerCount--;
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});