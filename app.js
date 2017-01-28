var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var schema = mongoose.Schema;
var app = express();

app.use(bodyParser.urlencoded({
  extended : true
}))

mongoose.connect("mongodb://localhost/googlelogin", function(err){
  if(err){
    console.log("DB Error!")
  }
  else {
    console.log("DB Connect Success!")
  }
})

var UserSchema = new schema({
  username : {
    type : String
  },
  id : {
    type : String
  },
  password : {
    type : String
  }
})

var User = mongoose.model('user', UserSchema);

app.listen(3000, function(err){
  if(err){
    console.log('Server Error!')
    throw err
  }
  else {
    console.log('Server Running At 3000 Port')
  }
})

app.post('/login', function(req,res){
  User.findOne({
    id : req.param('id'),
  }, function(err, result){
    if(err){
      console.log("/login Error!")
      throw err
    }
    else if(result){
      if(result.password == req.param('password')){
        console.log(result.username+" Login")
        res.json({
          success : true,
          message : "login success"
        })
      }
      else if(result.password != req.param('password')){
        res.json({
          success : false,
          message : "login failed"
        })
      }
    }
    else {
      res.json({
        success : false,
        message : 'account not found'
      })
    }
  })
})

passport.use(new GoogleStrategy({
    clientID: "792084842572-fbpnkm8t090gdepboun2v92tp4co9rvc.apps.googleusercontent.com",
    clientSecret: "UrlzGuabqD6Ev3IEHSScJnVi",
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
       User.findOrCreate({ googleId: profile.id }, function (err, user) {
         return done(err, user);
       });
  }
));
