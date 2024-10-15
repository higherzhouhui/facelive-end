var log4js = require('log4js')
const { errorResp, successResp } = require('../middleware/request')
const Model = require('../model/index')
const dataBase = require('../model/database')
const { logger } = require('../utils/common')

/**
 * get /api/product/list
 * @summary 查询主播列表
 * @tags product
 * @description 查询主播列表
 * @security - Authorization
 */
async function list(req, resp) {
  product_logger().info('查询主播列表', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const list = await Model.Product.findAll({
        order: [['score', 'asc']]
      })
      return successResp(resp, list, 'success')
    })
  } catch (error) {
    logger('product', 'error').error(`${req.id} 查询主播列表失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}


//----------------------------- private method --------------

// 配置日志输出
function product_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/product/product',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('product')
  return logger
}

module.exports = {
  list,
}