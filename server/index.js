const options = { /* ... */ }
const io = require('socket.io')({
    cors: {
        origin: '*',
    }
})

io.on('connection', socket => {
    socket.on('message', message => {
        socket.broadcast.send(message)
    })
})

io.listen(3000)