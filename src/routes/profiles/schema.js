const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const validation = require('validator');
const bcrypt = require('bcrypt');

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
    facebookId: {
      type: String,
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
    },
    token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.statics.findByCredentials = async (credentials, password) => {
  // we can login using username/email and we name it credentials

  const user = await ProfileModel.findOne({
    $or: [{ username: credentials }, { email: credentials }],
  });

  if (!user) {
    const error = new Error('Username/Password do not match!');
    error.httpStatusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Unable to login');
    error.httpStatusCode = 401;
    throw error;
  } else {
    return user;
  }
};

profileSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

profileSchema.methods.toJSON = function () {
  var obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.token;

  return obj;
};

ProfileModel = mongoose.model('profile', profileSchema);
module.exports = ProfileModel;
