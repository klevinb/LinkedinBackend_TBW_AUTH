const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const validation = require('validator');

const profileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          if (!validation.isLength(value, { min: 2 })) {
            throw new Error('Name should be at least 2 characters long!');
          }
        },
      },
    },
    surname: {
      type: String,
      required: true,
      validate: {
        validator: (value) => {
          if (!validation.isLength(value, { min: 2 })) {
            throw new Error('Name should be at least 2 characters long!');
          }
        },
      },
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: async (value) => {
          if (!validation.isEmail(value)) {
            throw new Error('Email is invalid');
          } else {
            const checkEmail = await ProfileModel.findOne({ email: value });
            if (checkEmail) {
              throw new Error('Email already existsts');
            }
          }
        },
      },
    },
    bio: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    facebookId:{
      type:String
    },
    cover: {
      type: String,
    },

    about: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      validate: {
        validator: async (value) => {
          const checkUsername = await ProfileModel.findOne({ username: value });
          if (checkUsername) {
            throw new Error('Username already exists!');
          }
        },
      },
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.token;

  return obj;
};

ProfileModel = mongoose.model('profile', profileSchema);
module.exports = ProfileModel;
