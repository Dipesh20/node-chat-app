const express = require('express')
const hbs = require('hbs')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/users')

const PublicDirectory = path.join(__dirname,'../public')
// const ViewsDirectory = path.join(__dirname,'../templates/views') 
// const PartialDirectory = path.join(__dirname,'../templates/partials') 

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// app.set('views',ViewsDirectory)
// app.set('view engine','hbs')
// hbs.registerPartials(PartialDirectory)

app.use(express.static(PublicDirectory))
const PORT = process.env.PORT || 3000
io.on('connection',(socket)=>{
    
    
    socket.on('join',({username,room},callback)=>{
        const {error,entry} = addUser({id:socket.id,username,room})
        if(error)
        {
            return callback(error)
        }
        socket.join(entry.room)
        socket.emit('message',generateMessage('Welcome!','Admin'))
        socket.broadcast.to(entry.room).emit('message',generateMessage(`${entry.username} has joined!`,entry.username))
        io.to(entry.room).emit('roomData',{
            room:entry.room,
            users:getUserInRoom(entry.room)
        })
        callback()
        // socket.on('disconnect',()=>{
        //     io.emit('message',generateMessage(`${username} has left!`))
        // })
    })

    socket.on('sendMessage',(message,callback)=>{
        
        const user = getUser(socket.id)
        const filter = new Filter() 
        if(filter.isProfane(message))
        {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(message,user.username))
        callback()
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`,user.username))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left!`,user.username))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    })
}) 

server.listen(PORT)