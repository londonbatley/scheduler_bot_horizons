var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rtm = require('./bot').rtm;
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var User = require('./models.js').User;

var app = express();
var auth = new googleAuth();

// check if user has authenticated google calendar
//var oauth2client = new auth.Oauth2

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  res.json('hello');
})

app.get('/connect', async function(req, res){
  var user = await User.findById(req.query.auth_id);
  console.log(user)
})



app.listen(3000);

rtm.start();