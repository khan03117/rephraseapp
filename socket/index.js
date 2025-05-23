const express = require('express')
const app = express()
const https = require('https');
const events = require('events');
const fs = require('fs');
const { WebSocketServer, WebSocket } = require("ws");
require('dotenv').config();
const options = {
    key: fs.readFileSync('./ssl/private.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem')
}
const server = https.createServer(options, app);
const wss = new WebSocketServer({ server });
const emitter = new events.EventEmitter();

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.type == "joinRoom") {
            ws.room = parsedData.room_id;
            // ws.user_id = parsedData.user_id;
        }
    });
    ws.on('close', (data) => {
        console.log(data);
    });
})

emitter.on('apiEvent', (data) => {
    let community = data.roomId;
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN && community.toString() == client.room.toString()) {
            client.send(JSON.stringify(data));
        }
    });
});
module.exports = { app, server, emitter }