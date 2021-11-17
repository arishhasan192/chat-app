const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//io.on allows us to run some code when client is connected
io.on('connection', (socket)=>{
    //socket is an object contains information about the new connection
    console.log('New Websocket connected');

    //To send an event to client we use emit on the server
    // socket.emit('countUpdated',count)

    //To receive an event that client is sending
    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count) //It is used to emit an event to a particular connection not to all

    //     //To emit to every connection availaible
    //     io.emit('countUpdated',count)
    // })

   

     socket.on('join',({username,room},callback)=>{
         //Every single connection has unique id assosciated to it
        const {error,user}= addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }
         //socket.join allows us to join a given chat room and we pass it name of room we want to join
         socket.join(user.room)

         //io.to.emit io.broadcast.to.emit --This is used to restrict emit event to a particular chat room. to is a function  

         socket.emit('message',generateMessage('Welcome!'))

         //To emit message to all the client except the current client who has joined
         socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
         io.to(user.room).emit('roomData',{
             room:user.room,
             users:getUsersInRoom(user.room)
         })
         callback()
     })

    //callback is used to acknowledge the event
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
           return callback('Profanity is not allowed') 
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback('Delivered!')
    })
 
    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps/?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

   //To run some code when given client is disconnected and disconnect is an event
   socket.on('disconnect',()=>{
    const user = removeUser(socket.id)
    
       //This will send message to all connected client
       if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
        io.to(user.room).emit('rootData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
       }
   })



})

//web socket allow full duplex communication that is biderectional communication

server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})



















