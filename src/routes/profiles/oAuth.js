const passport = require("passport");
const LinkedinStrategy = require("passport-linkedin-oauth2").Strategy;
const profileModel = require("./schema");
//const { authenticate } = require("../authorization/util");


passport.use(
  'linkedin',
  new LinkedinStrategy(
    {
      clientID: process.env.linkedin_Id,
      clientSecret: process.env.linkedin_Secret,
      callbackURL: "http://localhost:3008/api/profile/auth/linkedin/callback",
    },
    async (accessToken, refreshToken,profile, done) => {
      console.log(profile)
      const newUser = {
        LinkedinId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        role: 'user',
        token: [],
      };

      try {
        let user = await ProfileModel.findOne({ LinkedinId: profile.id });
        if (user) {
          done(null, user);
        }else{
          user= await user.create(newUser)
          done(null,user)
        }
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.serializeUser( (user, done) =>{
  done(null, user);
});

passport.deserializeUser( (user, done)=> {
  done(null, user);
});
