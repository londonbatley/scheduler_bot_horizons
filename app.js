var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rtm = require('./bot').rtm;
var google = require('googleapis');
var User = require('./models.js').User;

var app = express();
var OAuth2 = google.auth.OAuth2;

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

  var oauth2Client = new OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    'https://localhost:3000/connect/callback'
  );

  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/calendar'
    ],
    state: encodeURIComponent(JSON.stringify({
      auth_id: req.query.auth_id
    }))
  });
  res.redirect(url);
})




app.listen(3000);

rtm.start();