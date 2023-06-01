const express = require('express')
const app = express()
const server = require('http').Server(app)
const io=require('socket.io')(server);
const { v4: uuidV4 } = require('uuid') // uuid is to generate unique random ids which we will use as unique room IDs

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection',socket=>{
    socket.on('join-room',()=>{
        console.log('User connected');
    })
})



server.listen(3000)
