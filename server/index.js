// // server/index.js

// const express = require("express");

// // db connection
// const db = require('./configs/db.config');

// const PORT = process.env.PORT || 3001;

// const app = express();

// app.get("/api", (req, res) => {
//   res.json({ message: "Hello from server!" });
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });



// server/index.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const http = require('http');
// const port = 8000;
require('dotenv').config()
const cors = require('cors');
const {Server} = require('socket.io');

// app.use(express.static(path.resolve(__dirname, '../client/build')));

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  }
});
'use strict';


io.on('connection', (socket) => {
  const myID = socket.id;

  socket.on('join_room', (joinRoomData) => {
    socket.join(joinRoomData.room.id);
    console.log('new v')
    console.log(`User with ID: ${socket.id} has joined room: ${joinRoomData.room.id}`);
    socket.to(joinRoomData.room.id).emit('user_joined', {joinRoomData, socketID:socket.id});
  })

  socket.on('leave_room', (leaveRoomData) => {
    console.log('[socket]','leave room :', leaveRoomData.room.id);
    socket.leave(leaveRoomData.room.id);
    socket.to(leaveRoomData.room.id).emit('user_left', {leaveRoomData, socketID: myID});
  })

  socket.on('send_message', (data) => {
    console.log(data);
    // console.log(socket);
    socket.to(data.room.id).emit('receive_message', data);
    // console.log('success');
  })

  //// trying to get all users to refresh they're room list ////////
  socket.on('create_room', (roomData) => {
    console.log('roomData', roomData);
    socket.broadcast.emit('send_new_room', roomData);
  })

  socket.on('complete_session', (roomID) => {
    console.log('sent to server')
    socket.to(roomID).emit('complete_session_all');
  })

  socket.on('delete_room', (deleteInfo) => {
    console.log('delete sent to server', deleteInfo);
    socket.broadcast.emit('send_delete_room', deleteInfo);
  })

  socket.on('added_to_room', (addedData) => {
    console.log('sent added', addedData);
    socket.broadcast.emit('added_to_room_info', addedData);
  })

  socket.on('room_response', (onlineData) => {
    console.log('room members', onlineData.otherRoomMembers);
    console.log('socketID', onlineData.socketID);
    io.to(onlineData.socketID).emit('other_room_members', {socketID:myID, name: onlineData.otherRoomMembers});
  })
  ///// trying video //////
  // socket.on("stream", (data) => {
  //   socket.broadcast.to(data.room).emit('stream', data.video)
  // })
  //////////////////////// Playing Around!!! ////////////////////////
  // socket.on('add_url', (data) => {
  //   socket.to(data.room).emit('receive_url', data);
  // })
/////////////////////////////////////////////////////////////////////

  socket.on('disconnect', () => {
    socket.broadcast.emit('user_left', {socketID: myID})
  });
});


// db connection
const db = require('./configs/db.config');

app.use(morgan('dev'));
app.use(express.json());

// import the router(s)
const todosRouter = require('./routes/todos-router');
const usersRouter = require('./routes/users-router');
const messagesRouter = require('./routes/messages-router');
const roomsRouter = require('./routes/rooms-router');
const { createSocket } = require('dgram');

// app.use the router(s)
app.use('/todos', todosRouter);
app.use('/users', usersRouter);
app.use('/messages', messagesRouter);
app.use('/rooms', roomsRouter);


const PORT = process.env.PORT || 3001;

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// app.use('/users', usersRouter);
// All other GET requests not handled before will return our React app
///Nadya /////////////////////////////
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
////////////////////////////////////////////////////////
//////////// Nathan //////////////////////////
// if(process.env.NODE_ENV){
//   app.use( express.static(__dirname + '/client/build'));
//   app.get('*', (request, response) => {
//     response.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }
//////////////////////////////////////////////////


server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});