var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var rtm = require('./bot').rtm;
var google = require('googleapis');
var User = require('./models.js').User;
var mongoose = require('mongoose');
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
    'http://localhost:3000/connect/callback'
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

app.get('/connect/callback', function(req, res) {
  var oauth2Client = new OAuth2(
    process.env.GOOGLE_OAUTH_ID,
    process.env.GOOGLE_OAUTH_SECRET,
    'http://localhost:3000/connect/callback'
  );
   
  var accessCode = req.query.code;
  var state = decodeURIComponent(req.query.state);
  console.log('state', state)

// Swap temp code for access token
  oauth2Client.getToken(accessCode, function(err, tokens) {
    if (err) {
      console.log('Error is: ', err);
      res.send('There was an error');
    }
    oauth2Client.setCredentials(tokens);
    var plus = google.plus("v1");
    plus.people.get({auth: oauth2Client, userId: 'me'}, async function(err, user){
      if (err) {
        console.log('Error is with plus: ', err);
        res.send('There was an error with plus');
      }
      console.log(user);
      console.log('tokens', tokens);
      tokens.profile_id = user.id;
      tokens.profile_name = user.displayName;
      var mongouser = await User.findOne({_id: state.auth_id});
      console.log('user', mongouser);
      mongouser.google = tokens;
      await mongouser.save()
      rtm.sendMesssage('Yuuuuuuuuah dog we gucci', mongouser.slackDmId);
      res.send('fghjkhgfghj');
      // res.redirect('/connect/callback/success');
    })
  
  })


});

app.get('/connect/callback/success', function(req, res){
  res.send('Yah dog')
})


app.listen(3000);

rtm.start();