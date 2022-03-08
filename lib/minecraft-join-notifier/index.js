const { IncomingWebhook } = require('@slack/webhook');

function joinedUser(line) {
  const match = line.match(/^\[.{8}\].*: (.+) joined the game$/)
  return match ? match[1] : null
}

async function postToSlack(userName) {
  console.log('post to slack', userName)
  const url = process.env.SLACK_WEBHOOK_URL;
  const webhook = new IncomingWebhook(url);
  await webhook.send({
    text: `${userName} がログインしました`
  })
}

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const log = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())
      console.log('minecraft log record', log)
      const userName = joinedUser(log.message)
      if (userName) {
        await postToSlack(userName)
      }
    }
    catch (e) {
      console.error(e)
    }
  }
}

exports.joinedUser = joinedUser
