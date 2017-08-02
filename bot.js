var slack_token = process.env.SLACK_API_TOKEN;
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient(process.env.SLACK_BOT_TOKEN);
var web = new WebClient(process.env.SLACK_BOT_TOKEN);
let channel;
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
      if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
// rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//   rtm.sendMessage("MUA HAHAHAHAHA!", channel);
// });
// curl 'https://api.api.ai/api/query?v=20150910&query=remind%20me%20to%20text%20nipun&lang=en&sessionId=b73beb52-87db-4cf2-b81d-daadb9400c50&timezone=2017-08-01T16:11:17-0700' -H 'Authorization:Bearer aa01d2ef2709421da6dd98e167c32b32'
var { User } = require('./models')
var axios = require('axios')
// })
// this is the interactive message
rtm.on(RTM_EVENTS.MESSAGE, function(message) {
  console.log('message is:',message);
//dm = Direct message
var dm = rtm.dataStore.getDMByUserId(message.user);
//ignore direct messages
if(!dm ||dm.id !== message.channel || message.type !='message') {
  console.log('Message ignored')
  return;
}
// axios.post('https://api.api.ai/api/query?v=20150910', {
//       query: message.text,
//       lang: 'en',
//       sessionId: message.user,
//       timezone: 'America/Chicago'
//
//     }
//   , {
//     headers: {
//       'Authorization': `Bearer ${process.env.API_AI_TOKEN}`
//     }
//   })
User.findOne({slackId: message.user})
  .then(function({data}) {
console.log('DATAAAAAAAA:', data)
    if(data.result.actionIncomplete ) {
          rtm.sendMessage(data.result.fulfillment.speech, message.channel)
        }
    // if(data.result.parameters={}){
    //
    //   rtm.sendMessage(data.result.fulfillment.speech, message.channel)
    // }
    else{
          console.log('Action is incomplete: ', data.result)
          web.chat.postMessage(message.channel,'Creating reminder for ' + data.result.parameters.subject + ' on ' + data.result.parameters.date, {
            'attachments': [{
                "text": "sup dude, create reminder or cancel?",
                "fallback": "You are unable to choose an action",
                "callback_id": "action",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                  {
                  "name": "action",
                  "text": "Confirm",
                    "type": "button",
                   "value": "confirm"
                    },
                    {
                      "name": "action",
                      "text": "Cancel",
                      "type": "button",
                      "value": "cancel"
                    }
              ]
            }]
          },
          function(err, res) {
            if(err){
              console.log('I am in post error: ', err)
            }else{
              console.log('interactive sent')
            }
          }
        )
        }
  })
  .catch(function(err) {
    console.log("this is an error", err);
  })
})
rtm.start();
module.export={
  rtm: rtm
  // web: web
}
// use ngrok forwarding https://