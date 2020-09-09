const { verifyGeneratedJWT } = require('./util');
const ProfileModel = require('../profiles/schema');

const isUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (token) {
      const credentials = await verifyGeneratedJWT(token);

      const user = await ProfileModel.findById(credentials._id);

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).send('Check your username/passord');
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  isUser,
};
