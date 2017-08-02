var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rtm = require('./bot').rtm;
var google = require('googleapis');
var googleAuth = require('google-auth-library');


var app = express();
var auth = new googleAuth();

// check if user has authenticated google calendar
var oauth2client = new auth.Oauth2





app.listen(3000, 
  console.log('We good to go on port 3000 captain')
);

rtm.start();