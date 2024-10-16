const TelegramBot = require('node-telegram-bot-api');
const log4js = require('log4js')
// 用你的机器人Token替换YOUR_BOT_TOKEN
const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

bot_logger().info('6.BOT connection has establish successfully');

function bot_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/bot/bot',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('bot')
  return logger
}

module.exports = {
  bot,
  bot_logger,
}
// 引入相应操作
require('./callback')
require('./cmd')
require('./cronjob')