const _ = require('lodash');
const net = require('net');
const END = 'END';
const users = new Map();

const server = net.createServer();

const port = 2000;
const host = '127.0.0.1';

const sendMessage = (message, socketSent) => {
    for (const client of users.keys()) {
        if (client !== socketSent) {
            client.write(message);
        }
    }
    if (message === END) {
        const index = users.keys(socketSent);
        users.delete(index);
    }
};

server.listen(port, host, () => {
    console.log(`New connection from ${server.address().address}:${server.address().port}`)
    server.on('connection', (client) => {
        console.log(`New connection from ${client.remoteAddress}:${client.remotePort}`);
        const remoteUser = `${client.remoteAddress}:${client.remotePort}`;
        client.setEncoding('utf-8');
        client.on('data', (data) => {

            if (!users.has(client)) {
                let isRegistered = false;
                users.forEach((username) => {
                    if (username == data) {
                        data = client.write('The user is already registered, try to use other user. \nChoose different username: ');
                        isRegistered = true;
                        return;
                    }

                });

                if (!isRegistered) {
                    users.set(client, data);
                    console.log(remoteUser, 'ha cambiado el nombre a', data);
                    users.forEach((username) => {
                        if (username !== data) {
                            sendMessage(`${data} has joined the chat.`, client);
                        } else {
                            client.write(`Welcome ${data}`);
                            client.write(`Type any message to send it, type ${END} to finish`)

                        }
                    });
                }


            } else {
                const fulMsg = `${users.get(client)}: ${data}`;
                console.log(`${remoteUser} >> ${fulMsg}`);
                sendMessage(fulMsg, client);
            }
            return;
        });
        client.on('error', (err) => {
            if (err.errno == -4077) {
                console.log(`Client ${client} disconnected unexpectedly`);
                client.write(`Client ${client.remoteAddress} disconnected unexpectedly`);
            } else {
                console.error(err);
            }
            users.delete(client);
        });

        client.on('close', () => {

            console.log(`Connection with the user: ${users.get(client)} closed`);
            users.forEach((username) => {
                if (username !== users.get(client)) {
                    sendMessage(`${users.get(client)} has left the chat.`, client);
                }
            });
            users.delete(client);
            //process.exit(0);
        });

        server.on('error', (err) => {
            console.log(err);
            process.exit(1);
        });

        server.on('close', () => {
            console.log('Server closed');
            users.delete(client);

        }); //
    });

});