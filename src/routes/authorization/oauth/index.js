const passport = require('passport');
const { Strategy } = require('passport-facebook');
const UserModel = require('../../profiles/schema');
const { generateTokens } = require('../util');

const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.use(
  new Strategy(
    {
      clientID: '2445152759114026',
      clientSecret: '3de6c334d9df9f596afddc3f7c86dccf',
      callbackURL: 'http://localhost:3008/api/profile/auth/facebook/redirect',
      profileFields: [
        'id',
        'email',
        'link',
        'locale',
        'name',
        'timezone',
        'updated_time',
        'verified',
        'gender',
        'displayName',
      ],
    },

    async (accesToken, refreshToken, profile, done) => {
      const User = {
        facebookId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        bio: ' ',
        title: ' ',
        area: ' ',
        email: profile.emails[0].value,
        username:
          profile.name.givenName.toLocaleLowerCase() +
          profile.name.familyName.toLocaleLowerCase().slice(0, 1),
      };
      try {
        const findUser = await UserModel.findOne({ facebookId: profile.id });
        if (findUser) {
          const token = await generateTokens(findUser);
          done(null, token);
        } else {
          const checkUsername = await UserModel.findOne({
            username: User.username,
          });

          if (checkUsername) {
            checkUsername.facebookId = User.facebookId;
            await checkUsername.save({ validateBeforeSave: false });

            const token = await generateTokens(checkUsername);
            done(null, token);
          } else {
            const createUser = new UserModel(User);
            const user = await createUser.save();
            const token = await generateTokens(user);
            done(null, token);
          }
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  'linkedin',
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: 'http://localhost:3008/api/profile/auth/linkedin/callback',
      scope: ['r_liteprofile', 'r_emailaddress'],
    },
    async (accessToken, refreshToken, profile, done) => {
      const User = {
        linkedinId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        bio: ' ',
        title: ' ',
        area: ' ',
        image: profile.photos[3].value,
        email: profile.emails[0].value,
        username:
          profile.name.givenName.toLocaleLowerCase() +
          profile.name.familyName.toLocaleLowerCase().slice(0, 1),
      };

      try {
        const findUser = await UserModel.findOne({ linkedinId: profile.id });
        if (findUser) {
          const token = await generateTokens(findUser);
          done(null, token);
        } else {
          const checkUsername = await UserModel.findOne({
            username: User.username,
          });

          if (checkUsername) {
            checkUsername.linkedinId = User.linkedinId;
            await checkUsername.save({ validateBeforeSave: false });

            const token = await generateTokens(checkUsername);
            done(null, token);
          } else {
            const createUser = new UserModel(User);
            const user = await createUser.save();
            const token = await generateTokens(user);
            done(null, token);
          }
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
