const express = require('express')  // Importing express framework
const app = express()   // Creating instance/application object of Express application
const server = require('http').Server(app)  // importing http a built-in module like fs(file-system) module for handling http requests and responses
const io=require('socket.io')(server);  //importing socket.io library for real-time(without loading) bidirectional communication between server and client
const { v4: uuidV4 } = require('uuid') // uuid is to generate unique random ids which we will use as unique room IDs

// Setting up peerjs by importing express app for it and importing http module for peer and setting up options and port
var ExpressPeerServer = require('peer').ExpressPeerServer;
var peerExpress = require('express');
var peerApp = peerExpress();
var peerServer = require('http').createServer(peerApp);
var options = { debug: true }
var peerPort = 9000;

// Sets the view engine to ejs template express javascript template
app.set('view engine', 'ejs')
app.use(express.static('public'))

peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection',socket=>{
    socket.on('join-room',(roomId, userId)=>{
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('connected-user', userId);
    })
})



server.listen(3000)
peerServer.listen(peerPort);
