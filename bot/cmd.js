const { bot, bot_logger } = require('./index')
const operation = require('./data');
const utils = require('./utils');

// 设置命令处理函数
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  try {
    utils.startShow(msg)
  } catch (error) {
    bot_logger().error(`${chatId} start error: ${error}`)
  }
});


bot.onText(/\/menu/, async (msg) => {
  try {
    utils.menuShow(msg)
  } catch (error) {
    bot_logger().error(`menu error: ${error}`)
  }
});


bot.onText(/\/latest/, async (msg) => {
  try {
    utils.latestShow(msg)
  } catch (error) {
    bot_logger().error(`latest Error: ${error}`)
  }
})


bot.onText(/\/choose/, async (msg) => {
  try {
    utils.chooseShow(msg)
  } catch (error) {
    bot_logger().error(`choose Error: ${error}`)
  }
});

bot.onText(/\/rewards/, async (msg) => {
  try {
    utils.rewardsShow(msg)
  } catch (error) {
    bot_logger().error(`rewards Error: ${error}`)
  }
});

bot.onText(/\/refer/, async (msg) => {
  try {
    utils.referShow(msg)
  } catch (error) {
    bot_logger().error(`checkin Error: ${error}`)
  }
})

bot.onText(/\/guide/, async (msg) => {
  try {
    utils.guideShow(msg)
  } catch (error) {
    bot_logger().error(`checkin Error: ${error}`)
  }
})

bot.onText(/\/check/, async (msg) => {
  try {
    utils.checkShow(msg)
  } catch (error) {
    bot_logger().error(`check Error: ${error}`)
  }
})


bot.onText(/\/user/, async (msg) => {
  try {
    const chatId = msg.chat.id
    const userInfo = await operation.get_userInfo(msg)
    const config = await operation.get_config()
    const replyMarkup = {
      caption: `${userInfo.username}\n\nScore: ${userInfo.score} Pts\nStory Limit: ${userInfo.ticket}\nComplete Story Times: ${userInfo.complete}\nFriends: ${userInfo.count}\nInvite Link: ${config.bot_url}?start=${btoa(chatId)}`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Return",
              callback_data: 'menu'
            },
          ],
        ]
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup);
  } catch (error) {
    bot_logger().error(`user Error: ${error}`)
  }
})

bot.onText(/\/feedback/, async (msg) => {
  try {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'OK. Send me a FAQ and content. Please use this format:\n\b\bFAQ - content')
  } catch (error) {
    bot_logger().error(`feedback Error: ${error}`)
  }
})




bot.onText(/\/sendMessage/, async (msg) => {
  try {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'OK. Send me a password and content. Please use this format:\n\nPWD - XXX123 - content')
  } catch (error) {
    bot_logger().error(`checkin Error: ${error}`)
  }
})

bot.on('message', async (msg) => {
  // 要开启机器人的管理权限，然后在群组将机器人设置为管理员
  try {
    const chatId = msg.chat.id;
    const text = msg.text;
    console.log(chatId, 11111)
    const newUser = msg.new_chat_member
    if (newUser && !newUser.is_bot) {
      // 可判断任务是否完成
      bot.sendMessage(chatId, `Welcome <b>${newUser.username || newUser.first_name || newUser.last_name}</b> Join Channel`, {parse_mode: 'HTML'})
    }
  } catch (error) {
    bot_logger().error(`message Error: ${error}`)
  }
})

