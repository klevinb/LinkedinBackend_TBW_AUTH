const passport = require("passport");
const LinkedinStrategy = require("passport-linkedin-oauth2").Strategy;
const profileModel = require("./schema");
const { authenticate } = require("../authorization/util");

passport.use(
  new LinkedinStrategy(
    {
      clientID: process.env.linkedin_Id,
      clientSecret: process.env.linkedin_Secret,
      callbackURL: "http://localhost:3008/api/profile/callback",
    },
    async (token, profile, done) => {
      const newUser = {
        LinkedinId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        role: "user",
        token: [],
      };

      try {
        const user = await ProfileModel.findOne({ LinkedinId: profile.id });
        if (user) {
          const tokens = await authenticate(user);
          done(null, { user, tokens });
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
