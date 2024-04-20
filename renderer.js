const { ipcRenderer } = require('electron');
const db = require('./db-conn');

document.addEventListener('DOMContentLoaded', async () => {

  const getAllMessages = async () => {
    const response = await db.getTable('chatters');
    const allMessages = [];
    for (let i = 0; i < response.length; i++) {
      for (let j = 0; j < response[i].messages.length; j++) {
        allMessages.push({
          username: response[i].username,
          message: response[i].messages[j].message,
          timestamp: response[i].messages[j].timestamp,
        });
      }
    }
    allMessages.sort((a, b) => a.timestamp - b.timestamp);
    allMessages.forEach((message) => {
      displayMessage(message.username, message.message);
    });
  };

  const app = document.getElementById('app');
  const chatWindow = document.getElementById('chat-window');
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const loginContainer = document.getElementById('login-container');
  const loginForm = document.getElementById('login-form');
  const nameInput = document.getElementById('name');

  ipcRenderer.on('receive-message', (event, body) => {
    const { username, message } = body;
    displayMessage(username, message);
  });

  function displayMessage(username, text) {

    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
    <span class="username">${username}</span>
    <span class="text">${text}</span>
    `;
    chatWindow.querySelector('ul').appendChild(messageElement);
    app.scrollTop = chatWindow.scrollHeight;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = nameInput.value;
    if (username) {
      ipcRenderer.send('set-username', username);
      loginContainer.style.display = 'none';
      messageInput.hidden = false;
      sendButton.hidden = false;
    }
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = messageInput.value;
    if (message && message.trim() !== '' && message.length < 5000) {
      ipcRenderer.send('send-message', message);
      messageInput.value = '';
    } else {
      alert('Message is empty or too long');
    }
  });
  await getAllMessages();
});

