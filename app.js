var express = require('express')
var path = require('path');
var bodyParser = require('body-parser')
var app = express();
var {rtm, web} = require('./bot')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.static(path.join(__dirname, 'public')));


app.get('/',function(req,res) {
  console.log('hey dude, I am at /')
})
app.post('/slack/interactive', function(req,res) {
  var payload = JSON.parse(req.body.payload)
  console.log('THE BODY IS: ', payload)
  if(payload.actions[0].value === 'confirm') {
    var attachment = payload.original_message.attachments[0]
    delete attachment.actions;
    attachment.text ='reminder set';
    attachment.color = '#53B987';
    res.json({
      replace_original: true,
      text: 'Created reminder',
      attachments: [attachment]
    })
  } else{
    var attachment = payload.original_message.attachments[0]
    delete attachment.actions;
    attachment.text ='canceled :(';
    attachment.color = '#ff0000';
    res.json({
      replace_original: true,
      text: 'canceled reminder',
      attachments: [attachment]
    })
  }
})
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2
var {User} = require('./models')
function getGoogleAuth() {
  retun new OAuth2(
   process.env.GOOGLE_CLIENT_ID,
   process.env.GOOGLE_CLIENT_SECRET,
   'http://localhost:3000/connect/callback'
 )
}
const GOOGLE_SCOPE: [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar'
]
app.get('/connect',function(req,res){
  var userId = req.query.user
  if(!userId) {
    res.status(400).send('Missing use id')
  } else{
    User.findById(userId)
    .then(function(user){
      if(!user) {
        res.status(404).send('Cannot find user')
      }else{
        var googleAuth = getGoogleAuth();
        var url = googleAuth.generateAuthUrl({
          access_type:'offline',
          prompt:'consent',
          scope: 'GOOGLE_SCOPE',
          state:'userId'
        })
        res.redirect(url)
      }
    })
  }
})
app.get('/connect/callback',function(req,res){
  var googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, function (err, tokens){
    if(err) {
      res.status(500).json({error: err})
    } else {
      googleAuth.setCredntials(tokens);
      var plus = google.plus('v1');
      plus.people.get({ auth: googleAuth, userId: 'me'}, function(err, googleUser) {
        if (err) {
                res.status(500).json({error: err});
            } else {
                User.findById(req.query.state)
                .then(function(mongoUser) {
                    mongoUser.google = tokens;
                    mongoUser.google.profile_id = googleUser.id;
                    mongoUser.google.profile_name = googleUser.displayName;
                    return mongoUser.save();
                })
                .then(function(mongoUser) {
                    res.send('You are connected to Google Calendar');
                    rtm.sendMessage("You're are now connected to Google Calendar", mongoUser.slackDmId)
                });
            }
        });
    }
  })
})
app.listen(3000)