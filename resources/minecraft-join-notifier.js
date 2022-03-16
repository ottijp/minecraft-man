const SlackWebhook = require('@slack/webhook').IncomingWebhook;
const DiscordWebhook = require('discord-webhook-node').Webhook;

function joinedUser(line) {
  const match = line.match(/^\[.{8}\].*: (.+) joined the game$/)
  return match ? match[1] : null
}

async function postToSlack(userName) {
  console.log('post to slack', userName)
  const url = process.env.SLACK_WEBHOOK_URL;
  if (url) {
    const webhook = new SlackWebhook(url);
    await webhook.send({
      text: `${userName} がログインしました`
    })
  }
}

async function postToDiscord(userName) {
  console.log('post to discord', userName)
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (url) {
    const webhook = new DiscordWebhook(url);
    await webhook.send(`${userName} がログインしました`);
  }
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const log = JSON.parse(record.body).message
      console.log('minecraft log record', log)
      const userName = joinedUser(log)
      if (userName) {
        await postToSlack(userName)
        await postToDiscord(userName)
      }
    }
    catch (e) {
      console.error(e)
    }
  }
}

exports.joinedUser = joinedUser
