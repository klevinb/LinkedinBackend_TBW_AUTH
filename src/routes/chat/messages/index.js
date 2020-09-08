const express = require('express');
require('dotenv').config();
const MessageModel = require('./schema');
const mongoose = require('mongoose');

const server = express();

server.get('/messages/:username', async (req, res) => {
  const messages = await MessageModel.find({ from: req.params.username });

  res.send(messages);
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dn7fa.mongodb.net/${process.env.DB_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(
    server.listen(process.env.SERVER_PORT, () => {
      console.log(`Server running port { ${process.env.SERVER_PORT} }`);
    })
  )
  .catch((err) => console.log(err));
