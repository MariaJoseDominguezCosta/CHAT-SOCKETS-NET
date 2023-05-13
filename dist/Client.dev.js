"use strict";

var net = require('net');

var readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var END = 'END'; //const port = 8080;

var client = new net.Socket();

var connect = function connect(host, port) {
  client.connect({
    host: host,
    port: port
  });
  client.on('connect', function () {
    console.log("Connected to ".concat(host, " on ").concat(port));
    readline.question('Enter a username to join the chat: ', function (username) {
      client.write(username);
      readline.on('line', function (message) {
        if (message === 'END') {
          client.write("".concat(username, " has left the chat."));
          client.end();
          process.exit(0);
        } else {
          client.write("".concat(message));
          console.log("TU:  ".concat(message));
        }
      });
    });
    client.on('data', function (data) {
      console.log('\x1b[3' + random() + 'm%s', data);
    }); // 

    client.on('close', function () {
      console.log('Connection closed');
      process.exit(0);
    });
    client.on('error', function (err) {
      if (err.errno == -4077) {
        console.log('Connection lost');
      } else {
        console.log("Error: ".concat(err));
      }

      process.exit(1);
    });
  });
};

connect('192.168.89.207', 3434);