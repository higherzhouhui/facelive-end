const { bot, bot_logger } = require('./index')
const operation = require('./data')
const utils = require('./utils');
const { cache } = require('../model/database');
const optionList = ['A', 'B', 'C', 'D']
// 处理按钮点击事件
bot.on('callback_query', async (msg) => {
  bot_logger().info('callback_query', `${JSON.stringify(msg)}`)
  try {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const message_id = msg.message.message_id
    const queryId = msg.id;

    if (data == 'menu') {
      utils.menuShow(msg)
      
    } else if (data == 'tasks') {
      const list = await operation.get_tasks(msg)
      const logo = 'https://img2.baidu.com/it/u=3453496786,1847995088&fm=253&fmt=auto?w=1423&h=800'
      let inline_keyboard = []
      list.forEach(item => {
        inline_keyboard.push([
          {
            text: `${item.name}`,
            url: item.link,
          },
        ])
        inline_keyboard.push([
          {
            text: 'Check',
            callback_data: `check-${item.id}`
          },
          {
            text: 'Claim',
            callback_data: `claim-${item.id}`
          }
        ])
      })
      inline_keyboard.push([
        {
          text: "Return",
          callback_data: `menu`
        },
      ])
      const replyMarkup = {
        reply_markup: {
          inline_keyboard
        }
      }
      bot.sendPhoto(chatId, logo, replyMarkup);

    } else if (data == 'check') {
      utils.checkShow(msg)
    } else if (data.includes('check-')) {
      const task_id = data.replace('check-', '')
      const name = await operation.check_tasks(msg, task_id)
      const logo = 'https://img2.baidu.com/it/u=2093533853,2293668299&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
      const replyMarkup = {
        caption: `${name} Task completed, go and claim the reward!`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Claim",
                callback_data: `claim-${task_id}`
              },
            ],
          ]
        }
      };
      bot.sendPhoto(chatId, logo, replyMarkup)
    } else if (data.includes('claim-')) {
      const task_id = data.replace('claim-', '')
      const message = await operation.done_tasks(msg, task_id)
      bot.sendMessage(chatId, message)
    } else if (data == 'feedBack') {
      bot.sendMessage(chatId, 'OK. Send me a FAQ and content. Please use this format:\n\nFAQ - content')
    } else if (data == 'checkIn') {
      utils.checkIn(msg)
    } else if (data == 'choose') {
      utils.chooseShow(msg)
    } else if (data.includes('beginScript-')) {
      const script_id = data.replace('beginScript-', '')
      const result = await operation.get_script_option(msg, script_id)

      if (result) {
        const source = `https://my-blog-seven-omega.vercel.app/static/gif/${result.source}.gif`
        const list = result.list
        const inline_keyboard = []
        let caption = `<b>${result.title}</b>\n\n${result.text}\n\n<b>You decide:</b>\n`
        list.forEach((item, index) => {
          caption += `<b>${optionList[index]}：</b>${item.label}\n`
          if (index == 0) {
            inline_keyboard.push([
              {
                text: optionList[index],
                callback_data: `option-${list[index].id}`
              },
              {
                text: optionList[index + 1],
                callback_data: `option-${list[index + 1].id}`
              },
            ])
          }
        })

        // 构建带有图片和按钮的消息
        const replyMarkup = {
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inline_keyboard
          }
        };
        const botMsg = await bot.sendVideo(chatId, source, replyMarkup, { contentType: 'application/octet-stream', filename: 'begin' });
        cache.set(`sendChoose${chatId}`, botMsg.message_id)
      } else {
        bot.sendMessage(chatId, 'limit is not enough!')
      }
    } else if (data.includes('option-')) {
      const option_id = data.replace('option-', '')

      const result = await operation.choose_option(msg, option_id)
      if (result.code == 0 || result.code == 400) {
        // const imageUrl = getLocalSource(`./public/gif/${result.data.source}.gif`)
        const imageUrl = `https://my-blog-seven-omega.vercel.app/static/gif/${result.data.source}.gif`
        
        const list = result.data.list
        const inline_keyboard = []
        let caption = `<b>${result.data.title}</b>\n\n${result.data.text}\n\n`
        list.forEach((item, index) => {
          if (result.data.shortOver || result.data.longOver) {
            if (index == 0) {
              inline_keyboard.push([
                {
                  text: list[index].label,
                  callback_data: `${list[index].value}-${list[index].id}`
                },
                {
                  text: list[index + 1].label,
                  callback_data: `${list[index + 1].value}-${list[index + 1].script_id}`
                }
              ])
            }
          } else {
            if (index == 0) {
              caption += '<b>You decide:</b>\n'
              inline_keyboard.push([
                {
                  text: optionList[index],
                  callback_data: `option-${list[index].id}`
                },
                {
                  text: optionList[index + 1],
                  callback_data: `option-${list[index + 1].id}`
                }
              ])
            }
            caption += `<b>${optionList[index]}：</b>${item.label}\n`
          }
        })
        // 构建带有图片和按钮的消息
        const replyMarkup = {
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: inline_keyboard
          }
        };
        if (result.msg) {
          bot.sendMessage(chatId, result.msg)
        }
        const botMsg = await bot.sendVideo(chatId, imageUrl, replyMarkup, { contentType: 'application/octet-stream', filename: 'begin' });
        try {
          const last_option = await cache.get(`sendChoose${chatId}`)
          bot.deleteMessage(chatId, last_option)
        } catch (error) {
          console.error(error)
          bot_logger().error(`deleteMessage-${chatId}`, `${error}`)
        }
        cache.set(`sendChoose${chatId}`, botMsg.message_id)
      }
    } else if (data.includes('over-')) {
      // const option_id = data.replace('over-', '')
      // await operation.game_over(msg, option_id)
      // utils.startShow(msg)
      utils.checkShow(msg)
    } else if (data.includes('restart-') || data == 'latest' || data.includes('story-')) {
      let script_id = ''
      if (data.includes('restart-')) {
        script_id = data.replace('restart-', '')
      }
      if (data.includes('story-')) {
        script_id = data.replace('story-', '')
      }
      utils.latestShow(msg, script_id)
    } else if (data == 'share_link') {
      utils.referShow(msg)
    } else if (data == 'rewards') {
      utils.rewardsShow(msg)
    }
    bot.answerCallbackQuery(queryId)
  } catch (error) {
    bot_logger().error('callback_query', `${error}`)
    console.error(error)
  }
});

