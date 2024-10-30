const operation = require('./data')
const { bot, bot_logger } = require('./index')
const fs = require('fs')

const share_text = ``

async function codeToEnLabel(type, code) {
  try {
    
   
    return messages[key]
  } catch (error) {
    console.error(error)
    return key
  }
}

async function getMessage(id, key) {
  try {
    const lang = await operation.get_language(id)
    const messages = require(`../locales/${lang}/messages.json`)
    return messages[key]
  } catch (error) {
    console.error(error)
    return key
  }
}

function getLocalSource(url) {
  const source = fs.createReadStream(url)
  return source
}

async function startShow(msg) {
  try {
    let chatId;
    let type = false
    if (msg.chat) {
      chatId = msg.chat.id
      type = msg.chat.type
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
      type = msg.message.chat.type
    }
    if (type !== 'private') {
      return
    }

    // 创建新用户
    await operation.create_user(msg)
    const config = await operation.get_config()
    const link = `${config.bot_link}?start=${btoa(chatId)}`
    const hi = await getMessage(chatId, 'hi')
    const welcome = `- Thousands of girls are ready to have one-on-one video chats with you. New girls join every day. 💃🏻\n-  Join their private group to get exclusive hot photos, videos, and live streams. 📸\n-  Explore hidden groups and discover more free content waiting for you aged 18 and above.🔞`
    const welcomeDesc = `Hey, come join me!
Thousands of girls are ready for one-on-one video chats with you, and new faces are joining every day! 💃🏻
Explore hidden groups to discover more free 18+ content waiting for you! 🔞
Click the link to sign up and start your amazing journey!`
    const subscribeChannel = await getMessage(chatId, 'subscribeChannel')
    const source = 'https://www.facelive.top/welcome.png';
    const text = `\n<b>${hi} ${msg.chat.first_name || msg.chat.username || msg.chat.last_name}</b>\n\n ${welcome}\n`;
    const replyMarkup = {
      caption: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `💝 FaceLive Girl`,
              url: config.tg_link,
            },
          ],
          [
            {
              text: `Invite friends to get more Coins`,
              switch_inline_query: `${welcomeDesc}\n${link}`
            },
          ],
          // [
          //   {
          //     text: await getMessage(chatId, 'joinChannel'),
          //     url: config.channel_url,
          //   }
          // ],
        ]
      }
    };

    bot.sendPhoto(chatId, source, replyMarkup);
  } catch (error) {
    bot_logger().error('start show error:', `${error}`)
  }
}

async function checkShow(msg) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const userInfo = await operation.get_userInfo(msg)
    const config = await operation.get_config()
    const replyMarkup = {
      caption: `<b>${userInfo.username}</b>\n\nScore: <b>${userInfo.score}</b> Pts\nStory Limit: <b>${userInfo.ticket}</b>\nComplete Story Times: <b>${userInfo.complete}</b>\nFriends: <b>${userInfo.count}</b>\nInvite Link: ${config.bot_url}?start=${btoa(chatId)}`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Menu",
              callback_data: 'menu'
            },
          ],
        ]
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup);
  } catch (error) {
    bot_logger().error('checkShow error:', `${error}`)
  }
}

async function rewardsShow(msg) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const config = await operation.get_config()
    const link = `${config.bot_url}?start=${btoa(chatId)}`
    const text = `🎁 Start Your Day with More Rewards!\n\nCheck in every day to unlock growing bonuses. Complete your daily tasks to boost your points and reach the next level!`;
    const replyMarkup = {
      caption: text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Daily Check-In",
              callback_data: 'checkIn',
            },
          ],
          [
            {
              text: "Invite for Points",
              switch_inline_query: `${share_text}\n${link}`
            },
          ],
          [
            {
              text: "Follow Our X (+1 Story Limit)",
              url: 'https://x.com/Clickminiapp',
            },
          ],
          [
            {
              text: "Subscribe to Our Channel(+1 Story Limit)",
              url: 'https://t.me/Click_announcement',
            }
          ],
          [
            {
              text: "Join Our Group (+1 Story Limit)",
              url: 'https://t.me/Click_announcement',
            }
          ],
          [
            {
              text: "FAQ",
              url: config.faq_url,
            }
          ],
        ]
      }
    };

    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup);
  } catch (error) {
    bot_logger().error('rewardsShow error:', `${error}`)
  }
}

async function checkIn(msg) {
  try {


    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const signObj = await operation.user_checkIn(msg)
    if (signObj) {
      const caption = `<b>${signObj.username} CheckIn successful!</b>\n\n<b>+${signObj.ticket}</b> limit ${signObj.score > 0 ? `<b>+${signObj.score}</b> Pts` : ''}   Day: <b>${signObj.day}</b>\n\nCheckIn for <b>7</b> consecutive days and receive a great gift!\nInterrupt check-in and recalculate days\nCheck in available at <b>00:00 (UTC+0)</b> every day`
      const replyMarkup = {
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Return",
                callback_data: `menu`
              },
            ],
          ]
        }
      };
      bot.sendMessage(chatId, caption, replyMarkup)
    } else {
      bot.sendMessage(chatId, 'please exec start command')
    }
  } catch (error) {
    bot_logger().error('checkIn error:', `${error}`)
  }
}

async function menuShow(msg) {
  try {
    let chatId;
    let username;
    if (msg.chat) {
      chatId = msg.chat.id
      username = msg.chat.username
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
      username = msg.message.chat.username
    }
    const config = await operation.get_config()
    const link = `${config.bot_url}?start=${btoa(chatId)}`
    const source = 'https://my-blog-seven-omega.vercel.app/static/gif/introduce.gif'
    const replyMarkup = {
      caption: `<b>Menu</b>`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Latest Story",
              callback_data: "latest"
            },
          ],
          [
            {
              text: "Choose Your Story",
              callback_data: "choose"
            }
          ],
          [
            {
              text: "Daily Rewards",
              callback_data: "rewards"
            },
          ],
          [
            {
              text: "Quick Refer",
              switch_inline_query: `${share_text}\n${link}`
            },
          ],
          [
            {
              text: "Guide",
              url: config.guide_url
            },
          ],
          [
            {
              text: "Current Points and Story Limits",
              callback_data: "check"
            },
          ],
        ]
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup);
  } catch (error) {
    bot_logger().error('menuShow error:', `${error}`)
  }
}

async function referShow(msg) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const config = await operation.get_config()
    const link = `${config.bot_url}?start=${btoa(chatId)}`
    const replyMarkup = {
      caption: `You're referral link: \n${link}`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Invite for Points",
              switch_inline_query: `${share_text}\n${link}`
            },
          ],

        ]
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup)
  } catch (error) {
    bot_logger().error('referShow error:', `${error}`)
  }
}

async function guideShow(msg) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const config = await operation.get_config()
    const replyMarkup = {
      caption: `guide link: \n${config.guide_url}`,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Guide",
              url: config.guide_url
            },
          ],

        ]
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup)
  } catch (error) {
    bot_logger().error('guideShow error:', `${error}`)
  }
}


async function chooseShow(msg) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const list = await operation.get_scripts(msg)
    const inline_keyboard = []
    list.forEach(item => {
      inline_keyboard.push([
        {
          text: item.name,
          callback_data: `story-${item.id}`
        }
      ])
    })
    inline_keyboard.push([
      {
        text: 'Return',
        callback_data: 'menu'
      }
    ])
    // 构建带有图片和按钮的消息
    const replyMarkup = {
      caption: '<b>Please select the story you want to play!</b>',
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inline_keyboard
      }
    };
    bot.sendMessage(chatId, replyMarkup.caption, replyMarkup);
  } catch (error) {
    bot_logger().error('chooseShow error:', `${error}`)
  }
}

async function latestShow(msg, option_id) {
  try {
    let chatId;
    if (msg.chat) {
      chatId = msg.chat.id
    }
    if (msg.message && msg.message.chat) {
      chatId = msg.message.chat.id
    }
    const detail = await operation.get_script_detail(msg, option_id)
    const userInfo = await operation.get_userInfo(msg)
    const logo = detail.logo
    let caption = `You've selected the script: <b>${detail.name}</b>\n\nYou currently have <b>${userInfo.ticket}</b> story limits.\nStarting this script will use <b>${detail.config.choose_jb}</b> story limit.\nDo you want to continue?`
    if (detail.isDone) {
      caption = `You've complete the script: <b>${detail.name}</b>\n\nYou currently have <b>${userInfo.ticket}</b> story limits.\nReset this script will use <b>${detail.config.reset_jb}</b> story limit.\nDo you want to continue?`
    } else if (detail.isBegin) {
      caption = `You've selected the script: <b>${detail.name}</b>\n\nYou haven't completed the script yet.\nDo you want to continue?`
    }
    const replyMarkup = {
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Continue',
              callback_data: `beginScript-${detail.id}`
            },
            {
              text: "Return",
              callback_data: `menu`
            },
          ],
          [
            {
              text: "Choose Your Story",
              callback_data: "choose"
            }
          ],
          [
            {
              text: 'Need More Limits?',
              callback_data: `rewards`
            },
          ]
        ]
      }
    };
    bot.sendPhoto(chatId, logo, replyMarkup)
  } catch (error) {
    bot_logger().error('latestShow error:', `${error}`)
  }
}


module.exports = {
  getMessage,
  getLocalSource,
  startShow,
  checkIn,
  menuShow,
  latestShow,
  rewardsShow,
  chooseShow,
  checkShow,
  referShow,
  guideShow,
}