const express = require('express');
const http = require('http');
const listEndpoints = require('express-list-endpoints');
const cors = require('cors');
const { join } = require('path');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const { notFound, badRequest, generalError } = require('./errorHandlers');
const { verifyToken } = require('./routes/authorization/util');
const helmet = require('helmet');
const cookieParse = require('cookie-parser');
const chat = require('./routes/chat/index');

const port = process.env.PORT || 3003;
const publicPath = join(__dirname, '../public');

const app = express();
app.use(helmet());

const server = http.createServer(app);

chat(server);

const whiteList = process.env.WL;

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cookieParse());
app.use(express.json());
app.use(cors(whiteList));
app.use(express.static(publicPath));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(badRequest);
app.use(generalError);

console.log(listEndpoints(app));

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dn7fa.mongodb.net/${process.env.DB_NAME}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(
    server.listen(port, () => {
      console.log(`Server running on port : ${port}`);
    })
  )
  .catch((err) => console.log(err));
