var log4js = require('log4js')

const Model = require('../model/index')

async function init_manager() {
  try {
    const list = [
      { account: 'admin', password: 'a123456', name: '管理员', role: '0' },
      { account: '18516010812', password: 'a123456', name: '程序猿', role: '4' },
    ]
    list.map(async item => {
      await Model.Manager.create(item)
    })
  } catch (error) {
    admin_logger().error('init manage error:', error)
  }
}



async function init_groupList() {
  try {
    const data = []
    data.forEach(async item => {
      await Model.Group.create(item)
    })
  } catch (error) {
    admin_logger().error('init group error:', error)
  }
}


//----------------------------- private method --------------
// 配置日志输出
function admin_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/admin/admin',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('admin')
  return logger
}

async function init_baseData() {
  await init_manager();
}


module.exports = {
  init_baseData,
}