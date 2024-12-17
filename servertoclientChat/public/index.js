const socket = io();

// Add your client-side Socket.IO event handlers here
socket.on('connect', () => {
    console.log('Connected to server');
});

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });



socket.on('chat message', (msg)=>{ 
    const item = document.createElement('li');
    item.textContent = msg;
    if (msg.startsWith('Server:')) {
        item.style.color = 'blue';
        item.style.fontWeight = 'bold';
    } else if (msg.startsWith('Client:')) {
        item.style.color = 'black';
    }
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});