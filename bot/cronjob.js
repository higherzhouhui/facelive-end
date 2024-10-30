const cron = require('node-cron');
const { bot, bot_logger } = require('./index')
const operation = require('./data');
const utils = require('./utils')
const request = require('request')

async function getTonPrice() {
  try {
    request('https://www.okx.com/api/v5/market/ticker?instId=TON-USD-SWAP', function (err, response, body) {
      try {
        if (body) {
          const obj = JSON.parse(body)
          const price = obj.data[0].last
          operation.updateTonPrice(price)
        }
      } catch (error) {
         bot_logger().error('获取价格失败', `${error}`)
      }
 
    })
  } catch (error) {
    bot_logger().error('获取价格失败', `${error}`)
  }
}

async function sendMessageToChannel() {
  try {
    const config = await operation.get_config()
    const anchorInfo = await operation.getMessageToChannel()
    let star = ''
    for (let i = 0; i < Math.round(anchorInfo.star); i++) {
      star += '⭐️'
    }
    const replyMarkup = {
      caption: `\n<b>${anchorInfo.name} | ${anchorInfo.countryLabel},${anchorInfo.languageLabel} | ${anchorInfo.styleLabel} | ${anchorInfo.age} years old</b> \n\n#${anchorInfo.name} just received a new user review\n\n<b>Level: ${star} </b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Available | Video Chat with Her',
              url: config.tg_link,
            },

          ],
        ]
      }
    };
    const source = utils.getLocalSource(`./public${anchorInfo.home_cover}`)
    bot.sendPhoto(config.channel_id, source, replyMarkup)
  } catch (error) {
    bot_logger().error(`sendMessageToChannel Error: ${error}`)
  }
}
// Execute the task every 15 minutes, specified timezone Asia/Chongqing
cron.schedule('*/15 * * * *', () => {
  sendMessageToChannel()
}, {
  scheduled: true,
  timezone: 'Asia/Chongqing'
});

cron.schedule('*/5 * * * *', () => {
  getTonPrice()
}, {
  scheduled: true,
  timezone: 'Asia/Chongqing'
});

setTimeout(() => {
  getTonPrice()
}, 5000);