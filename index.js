const SlackBot = require('slackbots')
// const promisify = require('es6-promisify')
const FBRank = require('./FBRankModel')

require('dotenv').config()

const usersData = {}
const fbRegex = new RegExp('(^|\\W)free\\s+bee+rs*(\\W|$)', 'img')
const channel = process.env.SLACK_CHANNEL
const freeBeersResponses = [
  'Thank you {{user}} for that :beer: :smile:',
  'That :beer: has been recorded, {{user}} :wink:',
  'That one counts, {{user}}! :grin:'
]

const setFreeBeerResponse = user => {
  const index = Math.floor(Math.random() * freeBeersResponses.length)
  let response = freeBeersResponses[index]
  if (!response) response = freeBeersResponses[freeBeersResponses.length - 1]
  return response.replace('{{user}}', user)
}

const params = {
  icon_emoji: ':beers:'
}

const bot = new SlackBot({
  token: process.env.SLACK_TOKEN,
  name: process.env.BOT_NAME
})

bot.on('start', async () => {
  bot.postMessageToChannel(channel, 'Now my watch begins...', params)
  try {
    const users = await bot.getUsers()
    users.members.map(user => {
      usersData[user.id] = {
        id: user.id,
        name: user.name,
        realName: user.real_name
      }
    })
  } catch (e) {
    return console.error(`Promise error: ${e}`)
  }
})

bot.on('message', data => {
  if (
    data && data.user &&
    data.type === 'message' &&
    usersData[data.user] !== 'undefined' &&
    usersData[data.user].name !== process.env.BOT_NAME
  ) {
    if (fbRegex.test(data.text.toString())) {
      console.log('free beer!')
      // record it to database:
      FBRank.addFreeBeer(usersData[data.user], () => {
        const response = setFreeBeerResponse(usersData[data.user].realName)
        bot.postMessageToChannel(channel, response, params)
      })
    } else if (data.text.toString() === 'FBRanking') {
      console.log('Retrieving ranking...')
      FBRank.getRanking(s => {
        bot.postMessageToChannel(channel, s, params)
      })
    }
  }
})

console.log('Running!')
