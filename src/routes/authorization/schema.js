const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validation = require("validator");

const UserSchema = new Schema({
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: async (value) => {
        if (!validation.isEmail(value)) {
          throw new Error("Email is invalid");
        } else {
          const checkEmail = await UserModel.findOne({ email: value });
          if (checkEmail) {
            throw new Error("Email already existsts");
          }
        }
      },
    },
  },
  username: {
    type: String,
    required: true,
    validate: {
      validator: async (value) => {
        const checkUsername = await UserModel.findOne({ username: value });
        if (checkUsername) {
          throw new Error("Username already exists!");
        }
      },
    },
  },
  token: {
    type: String,
  },
});

UserSchema.statics.findByCredentials = async (email,password)=>{
  const user = await UserModel.findOne({email})
  const isMatch = await bcrypt.compare(password, user.password)
  if(!isMatch){
    const error = new Error("Unable to login")
    error.httpStatusCode = 401
    throw error
  }else{
    return user
  }
}

UserSchema.pre("save", async function (next){
  const user = this
  if(user.isModified("password")){
    user.password= await bcrypt.hash(user.password,10)
  }
  next()
})

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
