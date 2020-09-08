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
        const user = await UserModel.findOne({ facebookId: profile.id });
        if (user) {
          const token = await generateTokens(user);
          done(null, token);
        } else {
          const createUser = new UserModel(User);
          const user = await createUser.save();
          const token = await generateTokens(user);
          done(null, token);
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
      callbackURL: 'http://localhost:3005/api/profile/auth/linkedin/callback',
      profileFields: [
        'id',
        'email',
        'gender',
        'link',
        'locale',
        'name',
        'timezone',
        'updated_time',
        'verified',
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      // const newUser = {
      //   LinkedinId: profile.id,
      //   name: profile.name.givenName,
      //   surname: profile.name.familyName,
      //   email: profile.emails[0].value,
      //   role: 'user',
      //   token: [],
      // };

      try {
        console.log(profile);
        //   const user = await ProfileModel.findOne({ LinkedinId: profile.id });
        //   if (user) {
        //     const tokens = await authenticate(user);
        //     done(null, { user, tokens });
        //   } else [console.log(profile)];
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
