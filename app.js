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

app.get('/', function(req, res){
  res.send('login success')
})

app.post('/login', function(req,res){
  User.findOne({
    id : req.param('id'),
    password: req.param('password')
  }, function(err, result){
    if(err){
      console.log("/login Error!")
      throw err
    }
    if(result){
        console.log(result.username+" Login")
        res.json({
          success : true,
          message : "login success"
        })
    }
    else {
      res.json({
        success : false,
        message : 'account not found'
      })
    }
  })
})

app.post('/register', function(req, res){
  var user = new User({
    username : req.param('username'),
    id : req.param('id'),
    password : req.param('password')
  })
  User.findOne({
    id : req.param('id')
  }, function(err, result){
    if(err){
      console.log('/register Error!')
      throw err
    }
    else if(result){
      res.json({
        success : false,
        message : 'already added account'
      })
    }
    else {
      user.save(function(err){
        if(err){
          console.log("save Error")
          throw err
        }
        else {
          console.log(req.param('username')+" register success")
          res.json({
            success : true,
            message : "account save success"
          })
        }
      })
    }
  })
})

passport.serializeUser(function(user, done) {
  console.log("serialize")
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log("deserialize")
  done(null, user);
});

app.get('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'/*,'https://www.googleapis.com/auth/userinfo.profile'*/] }));

app.get('/auth/google/callback', //로그인후에 성공, 실패 여부에 따른 리다이렉션(링크이동)
passport.authenticate('google',
{
  successRedirect: '/',
  failureRedirect: '/'
}));


passport.use(new GoogleStrategy({
    clientID: '792084842572-fbpnkm8t090gdepboun2v92tp4co9rvc.apps.googleusercontent.com',
    clientSecret: 'UrlzGuabqD6Ev3IEHSScJnVi',
    callbackURL: "http://localhost:3000/auth/google/callback",
    profileFields: ['email','gender','name']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile._json.emails.value)
  }
));
