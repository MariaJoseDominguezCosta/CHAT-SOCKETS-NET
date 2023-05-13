"use strict";

var _ = require('lodash');

var net = require('net');

var END = 'END';
var users = new Map();
var server = net.createServer();
var port = 2000;
var host = '127.0.0.1';

var sendMessage = function sendMessage(message, socketSent) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = users.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var client = _step.value;

      if (client !== socketSent) {
        client.write(message);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (message === END) {
    var index = users.keys(socketSent);
    users["delete"](index);
  }
};

server.listen(port, host, function () {
  console.log("New connection from ".concat(server.address().address, ":").concat(server.address().port));
  server.on('connection', function (client) {
    console.log("New connection from ".concat(client.remoteAddress, ":").concat(client.remotePort));
    var remoteUser = "".concat(client.remoteAddress, ":").concat(client.remotePort);
    client.setEncoding('utf-8');
    client.on('data', function (data) {
      if (!users.has(client)) {
        var isRegistered = false;
        users.forEach(function (username) {
          if (username == data) {
            data = client.write('The user is already registered, try to use other user. \nChoose different username: ');
            isRegistered = true;
            return;
          }
        });

        if (!isRegistered) {
          users.set(client, data);
          console.log(remoteUser, 'ha cambiado el nombre a', data);
          users.forEach(function (username) {
            if (username !== data) {
              sendMessage("".concat(data, " has joined the chat."), client);
            } else {
              client.write("Welcome ".concat(data));
              client.write("Type any message to send it, type ".concat(END, " to finish"));
            }
          });
        }
      } else {
        var fulMsg = "".concat(users.get(client), ": ").concat(data);
        console.log("".concat(remoteUser, " >> ").concat(fulMsg));
        sendMessage(fulMsg, client);
      }

      return;
    });
    client.on('error', function (err) {
      if (err.errno == -4077) {
        console.log("Client ".concat(client, " disconnected unexpectedly"));
        client.write("Client ".concat(client.remoteAddress, " disconnected unexpectedly"));
      } else {
        console.error(err);
      }

      users["delete"](client);
    });
    client.on('close', function () {
      console.log("Connection with the user: ".concat(users.get(client), " closed"));
      users.forEach(function (username) {
        if (username !== users.get(client)) {
          sendMessage("".concat(users.get(client), " has left the chat."), client);
        }
      });
      users["delete"](client); //process.exit(0);
    });
    server.on('error', function (err) {
      console.log(err);
      process.exit(1);
    });
    server.on('close', function () {
      console.log('Server closed');
      users["delete"](client);
    }); //
  });
});