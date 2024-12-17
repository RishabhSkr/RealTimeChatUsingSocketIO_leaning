import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';
import { Server } from 'socket.io';
import readline from 'readline';

// whole code logic to send messgage to specific client - features like
// sever to all clients, server to specific client, client to server, 
// client to all clients, client to specific client

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

// Add this line to serve static files
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, './public/index.html'));
});

// yeh interface to read input from the terminal- yeh typescript ka interface nhi hai
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false // Add this line to prevent input echo
});


const connectedClients = new Map(); // Track connected clients

io.on('connection', (socket)=>{
    console.log('a user connected with ID:', socket.id);
    connectedClients.set(socket.id, socket); // Store socket reference
    
    // Broadcast updated user list to all clients
    io.emit('users update', Array.from(connectedClients.keys()));
    
    socket.emit('chat message', 'Server: Welcome to the chat!');

    socket.on('chat message', (msg)=>{
        console.log(`From ${socket.id}: `, msg);
        
        if (msg.to === 'broadcast') {
            // Broadcast message to everyone
            io.emit('chat message', {
                from: socket.id,
                content: msg.content,
                private: false
            });
        } else if (connectedClients.has(msg.to)) {
            // Send private message
            const targetSocket = connectedClients.get(msg.to);
            targetSocket.emit('chat message', {
                from: socket.id,
                content: msg.content,
                private: true
            });
            // Also send to sender
            socket.emit('chat message', {
                from: socket.id,
                content: msg.content,
                private: true
            });
        }
    });

    socket.on('disconnect', ()=>{
        console.log('user disconnected:', socket.id);
        connectedClients.delete(socket.id); // Remove socket reference
        // Broadcast updated user list after disconnect
        io.emit('users update', Array.from(connectedClients.keys()));
    });
})

// Now you can send to specific client
rl.on('line', (input) => {
    if (input) {
        const [targetId, ...messageParts] = input.split(' ');
        const message = messageParts.join(' ');
        
        if (connectedClients.has(targetId)) {

            // Send to specific client
            connectedClients.get(targetId).emit('chat message', {
                from: 'Server',
                content: message,
                private: true
            });
            console.log('\x1b[36m%s\x1b[0m', `Server message sent to ${targetId}: ${message}`);
        } else {
            // Broadcast to all
            io.emit('chat message', {
                from: 'Server',
                content: input,
                private: false
            });
            console.log('\x1b[36m%s\x1b[0m', 'Server message broadcast: ' + input);
        }
}});

// Add graceful shutdown
process.on('SIGINT', () => {
    rl.close();
    process.exit();
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});