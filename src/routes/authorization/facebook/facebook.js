const passport = require("passport")
const {Strategy} = require("passport-facebook")
const UserModel = require("../../profiles/schema")
const {generateTokens} = require("../util")



passport.use(
    
    new Strategy(
        {
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET, 
            callbackURL: "http://localhost:3004/api/profile/auth/facebook/redirect",
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']

        },

       async (accesToken,refreshToken,profile,done)=>{
           console.log(profile,"jsahdjlashljabsdkjhcljabsjbd")
      const User = {
          facebookId:profile.id,
          username:profile.givenName,
          name:profile.givenName,
          email:profile.emails[0].value,
          surname:profile.familyName,
          password:profile.id,
          token:""
      }
try{
const user = await UserModel.findOne({facebookId:profile.id})
if(user){
const token = await generateTokens(user)
done(null,{user,token})
}else{
    createUser =await UserModel.create(User)
    const tokens = await generateTokens(createUser)
    done(null,{user,tokens}) 
}
}catch(error){
    console.log(error)
    done(error)
}

        }
    )
)

passport.serializeUser(function(user,done){
    done(null,user)
})

passport.deserializeUser(function(user,done){
    done(null,user)
})

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
