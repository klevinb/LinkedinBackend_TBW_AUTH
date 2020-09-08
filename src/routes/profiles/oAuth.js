const passport = require('passport');
const LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;
const profileModel = require('./schema');
const { authenticate } = require('../authorization/util');

passport.use(
  'linkedin',
  new LinkedinStrategy(
    {
      clientID: process.env.LINKEDIN_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: 'http://localhost:3008/api/profile/auth/linkedin/callback',
      scope: ['r_emailaddress', 'r_basicprofile'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Here');
      const newUser = {
        LinkedinId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        role: 'user',
        token: [],
      };

      try {
        const user = await ProfileModel.findOne({ LinkedinId: profile.id });
        if (user) {
          const tokens = await authenticate(user);
          done(null, { user, tokens });
        } else [console.log(profile)];
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
