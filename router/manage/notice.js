var log4js = require('log4js')
const { errorResp, successResp } = require('../../middleware/request')
const Model = require('../../model/index')
const { bot } = require('../../bot/index')
const moment = require('moment')
const fs = require('fs')

async function getList(req, resp) {
  notice_logger().info('获取公告列表', req.id)
  try {
    const list = await Model.Notice.findAndCountAll()
    return successResp(resp, list, 'success')
  } catch (error) {
    notice_logger().info('Failed to view member list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function updateInfo(req, resp) {
  notice_logger().info('Update member information')
  try {
    const data = req.body
    if (data.id) {
      await Model.Notice.update(data, {
        where: {
          id: data.id
        }
      })
    } else {
      await Model.Notice.create({
        ...data,
        label: data.code,
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    notice_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

async function removeRecord(req, resp) {
  notice_logger().info('Update member information')
  try {
    const data = req.body
    await Model.Notice.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    notice_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

async function send(req, resp) {
  notice_logger().info('send notice')
  try {
    const { id } = req.body
    const noticeInfo = await Model.Notice.findByPk(id)
    const {btn1, btn2, btn1_url, btn2_url, content, cover} = noticeInfo.dataValues
    noticeInfo.update({
      send_time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    const inline_keyboard = []
    if (noticeInfo.btn1 && noticeInfo.btn1_url) {
      inline_keyboard.push([
        {
          text: btn1,
          url: btn1_url
        }
      ])
    }
    if (noticeInfo.btn2 && noticeInfo.btn2_url) {
      inline_keyboard.push([
        {
          text: btn2,
          url: btn2_url
        }
      ])
    }
    const replyMarkup = {
      caption: content,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inline_keyboard
      }
    };
    const all_user = await Model.User.findAndCountAll({
      attributes: ['user_id']
    })
    
    all_user.rows.forEach(item => {
      const chat_id = item.dataValues.user_id
      if (cover) {
        const source = fs.createReadStream(`./public${cover}`)
        bot.sendPhoto(chat_id, source, replyMarkup);
      } else {
        bot.sendMessage(chat_id, replyMarkup.caption, replyMarkup);
      }
    })

    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    notice_logger().info('send notice', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

// 配置日志输出
function notice_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/notice/notice',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('notice')
  return logger
}


module.exports = {
  getList,
  updateInfo,
  removeRecord,
  send,
}