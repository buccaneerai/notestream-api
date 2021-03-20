const request = require('request-promise');
const {from} = require('rxjs');

const sendSlackMessage = ({channel = 'new-signups', text}) => {
  const params = {
    method: 'POST',
    json: true,
    body: {channel, text},
    uri: process.env.SLACK_HOOK,
  };
  const promise = request(params);
  return from(promise);
};

module.exports = sendSlackMessage;
