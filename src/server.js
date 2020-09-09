const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const { join } = require("path");
const mongoose = require("mongoose");
const apiRoutes = require("./routes/api");
const { notFound, badRequest, generalError } = require("./errorHandlers");
const { verifyToken } = require("./routes/authorization/util");
const helmet = require("helmet");
const cookieParse = require("cookie-parser");
const passport = require("passport");
const { initialize } = require("passport");

const port = process.env.PORT || 3003;
const publicPath = join(__dirname, "../public");

const path = require("path");


const server = express();
server.use(helmet());

const whiteList = process.env.WL;

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cookieParse());
server.use(express.json());
server.use(cors(whiteList));
server.use(express.static(publicPath));

server.use(passport.initialize());

server.use("/api", apiRoutes);

server.use(notFound);
server.use(badRequest);
server.use(generalError);

console.log(listEndpoints(server));

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
