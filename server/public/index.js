const socket = io();

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const recipient = document.getElementById('recipient');
const toggleButton = document.getElementById('toggle-btn');

// handle disconeect and connect
toggleButton.addEventListener('click',(e)=>{
    e.preventDefault();
    if(socket.connected){
        socket.disconnect();
        toggleButton.textContent = 'Connect';
    }else{
        socket.connect();
        toggleButton.textContent = 'Disconnect';
    }
})

// Handle user list updates
socket.on('users update', (users) => {
    recipient.innerHTML = '<option value="broadcast">Everyone</option>';
    users.forEach(userId => {
        if (userId !== socket.id) { // Don't add ourselves to the list
            recipient.innerHTML += `<option value="${userId}">User ${userId}</option>`;
        }
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        const message = {
            to: recipient.value,
            content: input.value
        };
        socket.emit('chat message', message);
        input.value = '';
    }
});

socket.on('chat message', (msg) => { 
    const item = document.createElement('li');
    if (typeof msg === 'string') {
        // Handle legacy message format
        item.textContent = msg;
        if (msg.startsWith('Server:')) {
            item.style.color = 'blue';
            item.style.fontWeight = 'bold';
        }
    } else {
        // Handle new message format
        item.textContent = `${msg.from}: ${msg.content}`;
        if (msg.private) {
            item.style.color = 'green';
            item.style.fontStyle = 'italic';
        }
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});