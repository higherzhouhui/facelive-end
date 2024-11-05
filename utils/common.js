const jwt = require('jsonwebtoken')
const SECRET_KEY = 'FACE_LIVE'
const log4js = require('log4js')

function createToken(data) {
  const token = jwt.sign(
    { user: {username: data.username, id: data.id} },
    SECRET_KEY,
    { expiresIn: '10 days' }
  )
  return token
}

async function getMessage(lang, key) {
  try {
    let clang = 'en'
    if (lang && lang != 'null') {
      clang = lang 
    }
    const messages = require(`../locales/${clang}/messages.json`)
    return messages[key]
  } catch (error) {
    console.error(error)
    return key
  }
}

function timestampToTime(timestamp) {
  const date = new Date(timestamp * 1000) // 创建 Date 对象，使用时间戳作为参数
  const year = date.getFullYear() // 获取年份
  const month = date.getMonth() + 1 // 获取月份（注意：月份从0开始，所以需要加1）
  const day = date.getDate() // 获取日期
  const hours = date.getHours() // 获取小时
  const minutes = date.getMinutes() // 获取分钟
  const seconds = date.getSeconds() // 获取秒数

  // 格式化输出
  const formattedDate = `${year}-${pad(month)}-${pad(day)}`
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return `${formattedDate} ${formattedTime}`
}


function get_current_time() {
  return Math.floor(new Date().getTime() / 1000)
}

/**
 * 计算两数的百分比
 * @param {*} dividend
 * @param {*} divisor
 * @returns
 */
function divideAndFormatWithPercentage(dividend, divisor) {
  // 确保除数不为零，避免除零错误
  if (divisor === 0) {
    throw new Error('除数不能为零')
  }

  // 计算结果
  const result = (dividend / divisor) * 100

  // 保留两位小数并加上百分号
  const formattedResult = result.toFixed(2) + '%'

  return formattedResult
}

function format_current_time() {
  // 获取当前时间
  const currentDate = new Date()

  // 获取月份、日期、小时和分钟，并进行格式化
  const month = currentDate.getMonth() + 1 // 月份从 0 开始，所以要加 1
  const day = currentDate.getDate()
  const hours = currentDate.getHours()
  const minutes = currentDate.getMinutes()

  // 格式化时间
  const formattedTime = `${month}/${day} ${padZero(hours)}:${padZero(minutes)}`

  // 输出格式化后的时间
  console.log(`Formatted current time: ${formattedTime}`)
  return formattedTime
}


function scaleUpByNumber(number, wei = 18) {
  for (let i = 0; i < wei; i++) {
    number = number * 10
  }
  return Math.round(number)
}

function scaleDownByNumber(number, wei = 18) {
  for (let i = 0; i < wei; i++) {
    number = number / 10
  }
  return formatNumTen(number, 7)
}


function formatNumTen(money, length = 5) {
  let curZero = 1
  if (money) {
    if (length) {
      for (let i = 0; i < length; i++) {
        curZero *= 10
      }
    }
    return Math.round(money * curZero) / curZero
  } else {
    return 0
  }
}


function isLastDay(timestamp, diff) {
  const date = new Date()
  date.setDate(date.getDate() - diff)
  date.setHours(0, 0, 0, 0)
  const startTimeStamp = date.getTime()
  const endTimeStamp = startTimeStamp + 24 * 60 * 60 * 1000; // 24小时的毫秒数
  // 判断给定的时间戳是否在时间范围内
  return timestamp >= startTimeStamp && timestamp < endTimeStamp;
}

function logger(type) {
  const filename = `./logs/${type}/${type}`
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: filename,
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  const logger = log4js.getLogger('logs')
  return logger
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = {
  timestampToTime,
  get_current_time,
  divideAndFormatWithPercentage,
  format_current_time,
  formatNumTen,
  scaleUpByNumber,
  scaleDownByNumber,
  isLastDay,
  createToken,
  logger,
  getRandomInt,
  getMessage,
}
