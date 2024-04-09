const net = require('net');
const client = new net.Socket();

client.connect(59759, 'monorail.proxy.rlwy.net', function() {
  console.log('Connected to server');
});

client.on('close', function() {
  console.log('Connection closed');
});

client.on('error', function(err) {
  console.log('Error: ' + err);
});

module.exports = client;
