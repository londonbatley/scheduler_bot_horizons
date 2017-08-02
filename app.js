var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rtm = require('./bot').rtm;
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var User = require('./models.js');

var app = express();
var auth = new googleAuth();

// check if user has authenticated google calendar
//var oauth2client = new auth.Oauth2

app.get('/connect', async function(req, res){
  var user = await User.findById(req.query.auth_id);
  console.log(user)
})



app.listen(3000, 
  console.log('We good to go on port 3000 captain')
);

rtm.start();