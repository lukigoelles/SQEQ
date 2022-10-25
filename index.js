
const Net = require('net');
const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
server.listen(9898);


// The port number and hostname of the server.
const port = 51326;
const host = '192.168.1.30';


var buf = [];
const wsServer = new WebSocketServer({
    httpServer: server
});

const client = new Net.Socket();
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
        //client.write(Buffer.from(message.utf8Data, 'hex'));
        //console.log('Received Message:', message.utf8Data); 
        var str = message.utf8Data;
        console.log(str);
        let msg = Buffer.from(str,'hex');
        console.log(msg);
        client.connect({ port: port, host: host }, function() {
            client.write(msg);
        });
        //connection.sendUTF('Hi this is WebSocket server!');
      });
});




// var socket = client.connect({ port: port, host: host }, function() {
//     console.log('Client connected');
//     var test = Buffer.from('f712120b68004480','hex');
//     console.log(test);
//     //client.write(test);

// });

//socket.setTimeout(5e3, () => socket.destroy());



