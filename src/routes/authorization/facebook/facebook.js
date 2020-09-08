const passport = require('passport');
const { Strategy } = require('passport-facebook');
const UserModel = require('../../profiles/schema');
const { generateTokens } = require('../util');

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

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// passport.use('facebookToken', new FacebookStrategy({
//     clientID:process.env.clientID,
//     clientSecret:process.env.clientSecret,
// },
// async(accessToken,refreshToken,profile,done)=>{
// try{
//     if(await UserModel.findOne({'facebook_id':profile.id}))
//     return("This user already exist in mongo")

//  const email = profile.email[0].value
//  const {id:facebook_id,displayName:username} = profile
// const user = await UserModel.create({
//     email,facebook_id,username
// })
// await user.save()
// console.log(user)
// }catch(error){
//     done(error,false,error.message)
// }

// }))
