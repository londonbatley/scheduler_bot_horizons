"user strict"
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

var User = mongoose.model('User', {
  slackId: String,
  slackDmId: String,
  google: {
    profile_id: String,
    profile_name: String,
    access_token: String,
    id_token: String,
    refresh_token: String,
    token_type: String,
    expiry_date: Number
  },
  pending: String
})
module.exports = {
  User: User
}