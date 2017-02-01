var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var ejs = require('ejs')
var fs = require('fs')
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var schema = mongoose.Schema;
var app = express();

app.use(bodyParser.urlencoded({
  extended : true
}))
app.use(session({
  secret:'@#@$MYSIGN#@$#$',
  resave: false,
  saveUninitialized:true
}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:28001/googlelogin", function(err){
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

app.get('/gregister', function(req, res){
  fs.readFile('register.ejs', 'utf-8', function(err, data){
    res.end(ejs.render(data, {
      id : req.session.email,
      username : req.session.username
    }))
  })
})

app.post('/gregister', function(req, res){
  var body = req.body
  User.findOne({
    id : req.session.email
  },function(err, result){
    if(err){
      console.log('/gregister Error!')
      throw err
    }
    User.update({
      username : result.username,
      id : result.id,
      password : body.password
    }, function(err){
      if(err){
        console.log('update Error!')
        throw err
      }
      else {
        console.log(result.username+' update success!')
        res.json({
          success : true,
          message : "Update Success!"
        })
      }
    })
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

passport.use(new GoogleStrategy({
    clientID: '792084842572-fbpnkm8t090gdepboun2v92tp4co9rvc.apps.googleusercontent.com',
    clientSecret: 'UrlzGuabqD6Ev3IEHSScJnVi',
    callbackURL: "http://localhost:3000/auth/google/callback",
    profileFields: ['email','gender','name']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    console.log(profile._json.emails[0].value)
    console.log(profile.displayName)
    var user = new User({
      username : profile.displayName,
      id : profile._json.emails[0].value,
      password : 0
    })
    User.findOne({
      id : profile._json.emails[0].value
    }, function(err, result){
      if(err){
        console.log('/register Error!')
        throw err
      }
      else if(result){
        console.log(displayName+"already")
        done(null, true)
      }
      else {
        user.save(function(err){
          if(err){
            console.log("save Error")
            throw err
          }
          else {
            console.log(profile.displayName+" register success")
            done(null, true)
          }
        })
      }
    })
  }
));

app.get('/auth/google',
passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email'/*,'https://www.googleapis.com/auth/userinfo.profile'*/] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/gregister');
  });

//일시켜놓고 없어짐.....
