const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const MessageModel = require('./messages/schema');
const { getUsers, setUsername, removeUser } = require('./users/utilities');

const server = express();
const httpServer = http.createServer(server);

const io = socketio(httpServer);

io.on('connection', (socket) => {
  socket.on('setUsername', async ({ username }) => {
    const users = await setUsername(username, socket.id);
    const usernames = users.map((user) => user.username);

    io.emit('online', usernames);
  });

  socket.on('sendMessage', async (message) => {
    const onlineUsers = await getUsers();

    const newMessage = new MessageModel(message);
    const saveMessage = await newMessage.save();

    const socketId = onlineUsers.find(
      (user) => user.username === saveMessage.to
    );

    if (!socketId) {
      const err = new Error();
      err.httpStatusCode = 404;
      err.message = 'User not found!';
      throw err;
    }

    io.to(socketId.socketId).emit('message', {
      from: saveMessage.from,
      to: saveMessage.to,
      text: saveMessage.text,
    });
  });

  socket.on('disconnect', async () => {
    await removeUser(socket.id);

    const users = await getUsers();
    const usernames = users.map((user) => user.username);

    io.emit('online', usernames);
  });
});

const port = 3014;

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dn7fa.mongodb.net/${process.env.DB_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(
    httpServer.listen(port, () => {
      console.log(`Server running port { ${port} }`);
    })
  )
  .catch((err) => console.log(err));
