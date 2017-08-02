var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bodyParser = require('body-parser');
var WebClient = require('@slack/client').WebClient;
var User = require('./models').User
var mongoose = require('mongoose');

// const google = require('googleapis');
// const googleAuth = require('google-auth-library');

const axios = require('axios');

var bot_token = process.env.SLACK_BOT_TOKEN;

// const auth = new googleAuth();
var rtm = new RtmClient(bot_token); // use my own (snoop-dogg's) token to connect
var web = new WebClient(bot_token);


rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(startData){
  console.log('logged in as', startData.self.name)

})

// Makes Snoop live
rtm.on(RTM_EVENTS.MESSAGE, async function(message){

var slackUser = rtm.dataStore.getDMByUserId(message.user);

var user = await User.findOne({slackId: message.user});

if (!user) {
  var newUser = new User({
    slackId: message.user,
    name: slackUser.name,
    slackDMId: message.channel,
  })
  await newUser.save();
}

if (!user.google.profile_id) {
  rtm.sendMessage(`Click this link mf https://localhost:3000/connect?auth_id=${encodeURIComponent(user._id)}`, message.channel)
}


  AIquery(message.text, message.user)
  // pass message object into AIquery function
  .then(function(response) {
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
  }).catch(function(err) {
    console.log('This is the error: ', err);
  })

});

function AIquery(str, sessionId) {
  return axios.post('https://api.api.ai/v1/query?v=20150910', {
    query: str,
    sessionId: sessionId,
    lang: 'en',
    timezone: 'America/Chicago'
}, {
    headers: {
      "Authorization": `Bearer ${process.env.API_AI_TOKEN}`
    }
  } 
)
}


module.exports={ rtm, web }