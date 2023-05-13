const net = require('net');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const END = 'END';
//const port = 8080;
const client = new net.Socket();
const connect = (host, port) => {
    client.connect({ host, port });
    client.on('connect', () => {
        console.log(`Connected to ${host} on ${port}`);
        readline.question('Enter a username to join the chat: ', (username) => {
            client.write(username);
            readline.on('line', (message) => {
                if (message === 'END') {
                    client.write(`${username} has left the chat.`);
                    client.end();
                    process.exit(0);
                } else {
                    client.write(`${message}`);
                    console.log(`TU:  ${message}`);
                }
            });
        });
        client.on('data', (data) => {
            console.log('\x1b[3' + random() + 'm%s',data);
        }); // 
        client.on('close', () => {
            console.log('Connection closed');
            process.exit(0);
        });

        client.on('error', (err) => {
            if (err.errno == -4077) {
                console.log('Connection lost');
            } else {
                console.log(`Error: ${err}`);
            }
            process.exit(1);
        });
    });

}

connect('192.168.89.207', 3434);
