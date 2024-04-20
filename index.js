const { app, BrowserWindow, ipcMain } = require('electron');
const conn = require('./conn');
const db = require('./db-conn');

let win;
let name = "";
let currentMessages = [];

function createWindow() {
 win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
 });
 win.loadFile("index.html");
 //win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    conn.write(`${name} has left the chat room! - `);
    conn.end();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

conn.on('data', function(data) {
  const message = data.toString();
  if (!win) {
    console.log('No window to send message to');
    return;
  }
  const name = message.split(' - ')[0];
  const msg = message.split(' - ')[1];
  win.webContents.send('receive-message', { username: name, message: msg});
});

ipcMain.on('set-username', async (event, data) => {
  name = data;
  const worked = await db.createEntry('chatters', { username: name, messages: [] });
  if (worked.error) {
    currentMessages = await db.getField('chatters', { where: name, get: 'messages' });
  }
  conn.write(`${name} has joined the chat room! - `);
  event.sender.send('receive-message', { username: 'System', message: `Welcome ${name}!` });
});

ipcMain.on('send-message', async (event, message) => {
  conn.write(name + " - " + message);
  event.sender.send('receive-message', { username: name, message });
  currentMessages.push({ message, timestamp: Date.now() });
  const res = await db.updateEntry('chatters', { where: name, set: { messages: currentMessages } });
  console.log(res);
});
