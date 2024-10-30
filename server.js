const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const { token_auth, logger } = require('./middleware/index')
var log4js = require('log4js')
const path = require('path')
var bodyParser = require('body-parser')

if (process.env.NODE_ENV == 1) {
  require('dotenv').config({ path: './.env.dev' })
} else {
  require('dotenv').config({ path: './.env' })
}

require('./utils/swaggerUI')(app);

//配置静态文件目录
const staticDir = path.join(__dirname, 'public')
app.use(express.static(staticDir))

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ limit: '2mb', extended: false }))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// 解析formdata数据
// app.use(multipart())

// 存储IP和请求时间的缓存
const rateLimitCache = new Map();

// 清理旧的缓存记录的定时器
setInterval(() => {
  rateLimitCache.clear();
}, 20000); // 每20秒清理一次缓存
// 请求频率限制中间件
const rateLimiter = (req, res, next) => {
  let ip = req.headers['authorization'] || req.body.id
  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, 1);
  } else {
    const count = rateLimitCache.get(ip);
    if (count >= 100) { // 允许的最大请求次数
      return res.status(429).send('Too Many Requests');
    }
    rateLimitCache.set(ip, count + 1);
  }
  next();
};

app.use(rateLimiter);


// 跨域配置
// app.use(cors())

app.all("*", (req, res, next) => {  
  res.header("Access-Control-Allow-Origin", "*"); // 允许任意域名跨域  
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  next();  
}); 


// 定义不需要校验token的白名单接口
const white_list = [
  '/api/user/login',
  '/api/user/h5PcLogin',
  '/api/twitter/callback',
  '/api/system/scan_block',
  '/api/admin/migrateData',
  '/api/dogAdmin/login',
  '/api/system/resetTicket',
  /^\/api\/nft\/\d+$/,
  '/api/system/getConfig',
  '/api/system/getAllConfig',
]
app.use((req, resp, next) => {
  const path = req.path // 获取请求的路径
  // 检查路径是否在白名单中
  if (
    white_list.some((item) => {
      if (typeof item === 'string') {
        return item === path
      } else if (item instanceof RegExp) {
        return item.test(path)
      }
      return false
    })
  ) {
    return next()
  } else if (path.includes('/video/')) {
    return next()
  }
  token_auth(req, resp, next)
})
app.use(logger)

app.use('/api', require('./router/index'))

function system_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/system/s',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('system')
  return logger
}

const port = process.env.INIT ? 10002 : process.env.SERVER_PORT
app.listen(port, function () {
  system_logger().info('1.Api server is listen port:' + port)
})
