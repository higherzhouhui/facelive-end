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

/**
 * post /api/product/buy
 * @summary 购买coins
 * @tags product
 * @description 购买coins
 * @security - Authorization
 */
async function buy(req, resp) {
  product_logger().info('购买coins', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id, from_address, to_address } = req.body
      const productInfo = await Model.Product.findByPk(id)
      if (!productInfo) {
        return errorResp(resp, 400, `can't find this product`)
      }
      let userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      if (!userInfo) {
        return errorResp(resp, 403, `can't find this user`)
      }
      userInfo = await userInfo.increment({
        score: productInfo.score
      })
      let event_data = {
        type: 'recharge',
        from_user: req.id,
        from_username: userInfo.username,
        to_user: req.id,
        to_username: userInfo.username,
        score: productInfo.score,
        price: productInfo.price,
        from_address,
        to_address,
      }
      await Model.Event.create(event_data)
      // 去找上级
      if (userInfo.startParam) {
        const parentUserInfo = await Model.User.findOne({
          where: {
            user_id: userInfo.startParam
          }
        })
        if (parentUserInfo) {
          const config = await Model.Config.findOne()
          const ratio = config.invite_friends_ratio
          const increment_score = Math.floor(ratio * productInfo.score / 100)
          parentUserInfo.increment({
            score: increment_score
          })
          event_data = {
            type: 'recharge_parent',
            from_user: req.id,
            from_username: userInfo.username,
            to_user: parentUserInfo.user_id,
            to_username: parentUserInfo.username,
            score: productInfo.score,
            price: productInfo.price,
          }
          await Model.Event.create(event_data)
        }
      }
      return successResp(resp, userInfo, 'success')
    })
  } catch (error) {
    logger('product', 'error').error(`${req.id} 购买coins失败：${error}`)
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
  buy,
}