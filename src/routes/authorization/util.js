const jwt = require('jsonwebtoken');
const ProfileModel = require('../profiles/schema');

const generateTokens = async (user) => {
  try {
    const token = await generateJWT({ _id: user._id });
    const newUser = await ProfileModel.findById(user._id);
    newUser.token = token;
    await ProfileModel.findByIdAndUpdate(user._id, newUser);
    return { token };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const generateJWT = (payload) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      process.env.SECRET_KEYJWT,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const verifyGeneratedJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.SECRET_KEYJWT, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

// const generateRefreshJWT = (payload)=>
// new Promise((res,rej)=>
// jwt.sign(
// payload,
// process.env.SECRET_REFRESH_KEYJWT,
// {expiresIn:"2 week"},
// (err,token)=>{
//     if(err) rej(err)
//     res(token)
// }

// )
// )
// const verifyRefreshJWT=(token)=>
// new Promise((res,rej)=>
// jwt.verify(token,process.env).SECRET_REFRESH_KEYJWT,
// (err,decoded)=>{
//     if(err) rej(err)
//     res(decoded)
// }
// )

module.exports = {
  generateTokens,
  verifyGeneratedJWT,
};
