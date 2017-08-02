var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bodyParser = require('body-parser');

// const google = require('googleapis');
// const googleAuth = require('google-auth-library');

const axios = require('axios');

var bot_token = process.env.SLACK_BOT_TOKEN;

// const auth = new googleAuth();
var rtm = new RtmClient(bot_token); // use my own (snoop-dogg's) token to connect
var web = new WebClient(bot_token);




// Makes Snoop live
rtm.on(RTM_EVENTS.MESSAGE, function(message) {

  AIquery(message.text, message.user)
  // pass message object into AIquery function
  .then(function(response) {
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
  }).catch(function(err) {
    console.log('This is the error: ', err);
  })

})

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