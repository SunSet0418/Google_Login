var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var Schema = mongoose.schema;
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
