// node modules
const path = require('path')
const http = require('http')

// third party modules
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

//external files
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom, getAllRooms} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname,'../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log("Web Socket connection established")

    socket.on('getRooms',(callback) => {
        const rooms = getAllRooms()
        callback(rooms)
    })

    socket.on('join', (options,callback) => {
        addUser({id: socket.id, ...options}).then((user) => {
            socket.join(user.room)

            socket.emit('message', generateMessage("Admin",'Welcome !'))
            socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${user.username} has joined!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            callback()

        }).catch((error) => {
            callback(error.message)
        })
    })

    socket.on('messageSent', (message,callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback("Profanity is not allowed!")
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation', (location,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            // since current user has been disconnected, no need to use broadcast.
            io.to(user.room).emit('message', generateMessage("Admin",`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })                                               
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`)
})

