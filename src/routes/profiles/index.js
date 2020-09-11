const express = require('express');
const q2m = require('query-to-mongo');
const profileSchema = require('./schema');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const pdfdocument = require('pdfkit');
const { join } = require('path');
const ExperienceModel = require('../experience/schema');
const PostsModel = require('../posts/schema');
const MessageModel = require('../chat/messages/schema');
const ProfileModel = require('./schema');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const axios = require('axios');

// Authentication && Authorization
const { isUser } = require('../authorization/middleware');
const { generateTokens } = require('../authorization/util');
const passport = require('passport');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer();
const imagePath = path.join(__dirname, '../../../public/img/profiles');
const expPath = path.join(__dirname, '../../../public/img/experiences');

router.get('/messages', isUser, async (req, res) => {
  const messages = await MessageModel.find();

  res.send(messages);
});

router.delete('/messages', isUser, async (req, res) => {
  await MessageModel.collection.deleteMany();
  res.send('Done');
});

router.get('/', isUser, async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const profiles = await profileSchema
      .find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort);
    if (profiles.length > 0)
      res.send({
        data: profiles,
        total: profiles.length,
      });
    else res.status(404).send([]);
  } catch (error) {
    next(error);
  }
});

router.get('/me', isUser, async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
});

router.get('/:username', isUser, async (req, res, next) => {
  try {
    const profile = await profileSchema.findOne({
      username: req.params.username,
    });
    if (profile) {
      res.send(profile);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const newProfile = new profileSchema(req.body);
    const response = await newProfile.save();
    res.status(201).send(response);
  } catch (error) {
    next(error);
  }
});

router.put('/me', isUser, async (req, res, next) => {
  try {
    delete req.body.username;
    delete req.body.email;

    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save({ validateBeforeSave: false });
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:username/upload',
  upload.single('profile'),
  isUser,
  async (req, res, next) => {
    try {
      if (req.file) {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: 'profiles',
          },
          async (err, result) => {
            if (!err) {
              req.user.image = result.secure_url;
              await req.user.save({ validateBeforeSave: false });

              res.status(200).send('Done');
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
      } else {
        const err = new Error();
        err.httpStatusCode = 400;
        err.message = 'Image file missing!';
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  '/:username/upload/cover',
  isUser,
  upload.single('cover'),
  async (req, res, next) => {
    try {
      if (req.file) {
        const cld_upload_stream = cloudinary.uploader.upload_stream(
          {
            folder: 'covers',
          },
          async (err, result) => {
            if (!err) {
              req.user.cover = result.secure_url;
              await req.user.save({ validateBeforeSave: false });

              res.status(200).send('Done');
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
      } else {
        const err = new Error();
        err.httpStatusCode = 400;
        err.message = 'Image file missing!';
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:username/pdf', isUser, async (req, res, next) => {
  try {
    const profile = await profileSchema.findOne({
      username: req.params.username,
    });
    const getExp = await ExperienceModel.find({ username: profile.username });
    const doc = new pdfdocument();
    const url = profile.image;
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${profile.name}.pdf`
    );

    if (url.length > 0) {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      const img = new Buffer(response.data, 'base64');
      doc.image(img, 88, 30, {
        fit: [100, 100],
      });
    }

    doc.font('Helvetica-Bold');
    doc.fontSize(18);

    doc.text(`${profile.name} ${profile.surname}`, 100, 140, {
      width: 410,
      align: 'center',
    });
    doc.fontSize(12);
    doc.font('Helvetica');
    doc.text(
      `
    ${profile.title}
    ${profile.area}
    ${profile.email}`,
      360,
      180,
      {
        align: 'left',
      }
    );
    doc.fontSize(18);
    doc.text('Experiences', 100, 270, {
      width: 410,
      align: 'center',
    });
    doc.fontSize(12);
    const start = async () => {
      getExp.forEach(
        async (exp) =>
          doc.text(`
          Role: ${exp.role}
          Company: ${exp.company}
          Starting Date: ${exp.startDate.toString().slice(4, 15)}
          Description: ${exp.description}
          Area:  ${exp.area}
          -------------------------------------------------------
        `),
        {
          width: 410,
          align: 'center',
        }
      );
    };
    await start();

    let grad = doc.linearGradient(50, 0, 350, 100);
    grad.stop(0, '#0077B5').stop(1, '#004451');

    doc.rect(0, 0, 70, 1000);
    doc.fill(grad);

    doc.pipe(res);

    doc.end();
  } catch (error) {
    next(error);
  }
});

router.delete('/me', isUser, async (req, res, next) => {
  try {
    await req.user.remove();
    await ExperienceModel.collection.deleteMany({
      username: req.user.username,
    });
    await PostsModel.collection.deleteMany({ username: req.user.username });

    res.send('Deleted');
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { credentials, password } = req.body;

    const findUser = await ProfileModel.findByCredentials(
      credentials,
      password
    );

    if (findUser) {
      const token = await generateTokens(findUser);
      res.cookie('token', token.token, {
        httpOnly: true,
        sameSite: 'none',
      });
      res.send(findUser.username);
    } else {
      res.status(404).send('Incorrent email or password');
      console.log('Not Found');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    const userBody = new ProfileModel(req.body);
    const addUser = await userBody.save();
    if (addUser) {
      res.status(201).send(addUser._id);
    } else {
      const err = new Error();
      err.message = 'Something went wrong';
      err.httpStatusCode = 400;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/logout', isUser, async (req, res, next) => {
  try {
    req.user.token = '';
    await req.user.save({ validateBeforeSave: false });

    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

// oAuth
router.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/auth/facebook/redirect',
  passport.authenticate('facebook'),
  async (req, res, next) => {
    try {
      const token = req.user.token;
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: true,
      });

      res.writeHead(301, {
        Location: 'http://localhost:3000/profiles/me?' + req.user.username,
      });
      res.end();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get('/auth/linkedin', passport.authenticate('linkedin'));

router.get(
  '/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  async (req, res, next) => {
    try {
      const token = req.user.token;

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: true,
      });

      res.writeHead(301, {
        Location: 'http://localhost:3000/profiles/me?' + req.user.username,
      });
      res.end();
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = router;
