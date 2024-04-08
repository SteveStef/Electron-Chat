const net = require('net');

const client = new net.Socket();
const emit = require('./emitter');

client.connect(59759, 'monorail.proxy.rlwy.net', function() {
  console.log('Connected to server');
});

client.on('close', function() {
  console.log('Connection closed');
});

client.on('data', function(data) {
  console.log('Received: ' + data);
  emit.emit('receive-message', data.toString());
});

client.on('error', function(err) {
  console.log('Error: ' + err);
});

module.exports = client;
