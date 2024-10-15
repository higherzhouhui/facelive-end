var log4js = require('log4js')
const { errorResp, successResp } = require('../middleware/request')
const Model = require('../model/index')
const dataBase = require('../model/database')
const { logger } = require('../utils/common')

/**
 * get /api/anchor/list
 * @summary 查询主播列表
 * @tags anchor
 * @description 查询主播列表
 * @security - Authorization
 */
async function list(req, resp) {
  anchor_logger().info('查询主播列表', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { isCommend, country, language, style, group, page} = req.query
      if (isCommend) {
        const list = await Model.Anchor.findAll({
          order: [['sort', 'asc']],
          where: {
            isCommend: true
          }
        })
        return successResp(resp, list, 'success')
      } else {
        const where = {}
        if (country) {
          const _list = country.split(',')
          where.country = _list
        }
        if (language) {
          const _list = language.split(',')
          where.language = _list
        }
        if (style) {
          const _list = style.split(',')
          where.style = _list
        }
        if (group) {
          const _list = group.split(',')
          where.group = _list
        }
        const list = await Model.Anchor.findAll({
          order: [['sort', 'asc']],
          where: where,
          limit: 15,
          offset: page,
          offset: (page - 1) * 15,
        })
        return successResp(resp, list, 'success')
      }
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查询主播列表失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * get /api/anchor/detail
 * @summary 查询主播详情
 * @tags anchor
 * @description 查询主播详情
 * @security - Authorization
 */
async function info(req, resp) {
  anchor_logger().info('查询主播详情', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id } = req.query
      const detail = await Model.Anchor.findByPk(id)
      if (!detail) {
        return errorResp(resp, 400, 'not found this anchor!')
      }
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      if (userInfo) {
        const follow_anchor = userInfo.follow_anchor
        if (follow_anchor) {
          const list = follow_anchor.split(',')
          if (list.includes(`${id}`)) {
            detail.dataValues.isLike = true
          }
        }
      }
      return successResp(resp, detail.dataValues, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查询主播详情失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * post /api/anchor/follow
 * @summary 关注/取关主播
 * @tags anchor
 * @description 关注/取关主播
 * @security - Authorization
 */
async function follow(req, resp) {
  anchor_logger().info('关注/取关主播', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      let { id, status, heart } = req.body
      const detail = await Model.Anchor.findByPk(id)
      if (!detail) {
        return errorResp(resp, 400, 'not found this anchor!')
      }
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      if (userInfo) {
        let follow_anchor = userInfo.follow_anchor || ''
        if (!status) {
          heart += 1
          follow_anchor += `${id},`
        } else {
          follow_anchor = follow_anchor.replace(`${id},`, '')
          heart -= 1
        }
        await userInfo.update({
          follow_anchor: follow_anchor
        })
        await detail.update({
          heart: heart
        })
        const event_data = {
          type: !status ? 'follow' : 'unFollow',
          from_user: req.id,
          from_username: userInfo.username,
          to_user: detail.id,
          to_username: detail.name,
          score: 0,
          desc: `${userInfo.username} is ${!status ? 'follow' : 'unFollow'} ${detail.name}`
        }
        await Model.Event.create(event_data)
      }
      return successResp(resp, {status: !status, heart}, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 关注/取关主播失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * get /api/anchor/next
 * @summary 查看下一个主播
 * @tags anchor
 * @description 查看下一个主播
 * @security - Authorization
 */
async function next(req, resp) {
  anchor_logger().info('查看下一个主播', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id } = req.query
      const detail = await getNextAnchor(id)
      if (!detail) {
        return errorResp(resp, 400, 'No more!')
      }
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      if (userInfo) {
        const follow_anchor = userInfo.follow_anchor
        if (follow_anchor) {
          const list = follow_anchor.split(',')
          console.log(list)
          if (list.includes(`${detail.id}`)) {
            detail.isLike = true
          } else {
            detail.isLike = false
          }
        }
      }
      return successResp(resp, detail, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查看下一个主播失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * get /api/anchor/begin
 * @summary 开始播放直播
 * @tags anchor
 * @description 开始播放直播
 * @security - Authorization
 */
async function begin(req, resp) {
  anchor_logger().info('开始播放直播', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id } = req.query
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      if (!userInfo) {
        return errorResp(resp, 400, 'not found this user')
      }
      const anchorInfo = await Model.Anchor.findByPk(id)
      if (!anchorInfo) {
        return errorResp(resp, 400, 'not found this anchor')
      }
      if (userInfo.score < anchorInfo.coin) {
        return errorResp(resp, 388, 'Sorry, your credit is running low')
      }
      let chat_anchor = userInfo.chat_anchor
      
      if (chat_anchor) {
        const chat = chat_anchor.split(',')
        if (!chat.includes(id)) {
          chat_anchor += `${id},`
        }
      } else {
        chat_anchor = `${id},`
      }
      await userInfo.update({
        score: userInfo.score - anchorInfo.coin,
        chat_anchor: chat_anchor
      })
      await anchorInfo.increment({
        time: 60, 
        return: 1
      })
      const event_data = {
        type: 'chat_video',
        score: anchorInfo.coin,
        from_user: req.id,
        from_username: userInfo.username,
        to_user: id,
        to_username: anchorInfo.name,
        desc: `${userInfo.username}和主播：${anchorInfo.name} 开始视频聊天，消耗${anchorInfo.coin}金币`
      }
      await Model.Event.create(event_data)
      return successResp(resp, {time: anchorInfo.time + 60, ...userInfo.dataValues}, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 开始播放直播失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}


/**
 * get /api/anchor/followList
 * @summary 查询关注主播列表
 * @tags anchor
 * @description 查询关注主播列表
 * @security - Authorization
 */
async function followList(req, resp) {
  anchor_logger().info('查询关注主播列表', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      let list = []
      if (userInfo) {
        const follow_anchor = userInfo.follow_anchor
        if (follow_anchor) {
          let follow_list = follow_anchor.split(',')
          if (follow_list.length) {
            follow_list = follow_list.filter(item => {
              return !isNaN(item)
            })
            list = await Model.Anchor.findAll({
              attributes: ['avatar', 'name', 'country', 'id', 'coin'],
              where: {
                id: {
                  [dataBase.Op.in]: follow_list
                }
              }
            })
          }
        }
      }
      return successResp(resp, list, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查询关注主播列表失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}


/**
 * get /api/anchor/chatList
 * @summary 聊天过的主播列表
 * @tags anchor
 * @description 聊天过的主播列表
 * @security - Authorization
 */
async function chatList(req, resp) {
  anchor_logger().info('聊天过的主播列表', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      let list = []
      if (userInfo) {
        const t_chat_anchor = userInfo.chat_anchor
        if (t_chat_anchor) {
          let chat_anchor = t_chat_anchor.split(',')
          if (chat_anchor.length) {
            chat_anchor = chat_anchor.filter(item => {
              return !isNaN(item)
            })
            list = await Model.Anchor.findAll({
              attributes: ['avatar', 'name', 'country', 'id', 'coin'],
              where: {
                id: {
                  [dataBase.Op.in]: chat_anchor
                }
              }
            })
          }
        }
      }
      return successResp(resp, list, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 聊天过的主播列表失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

//----------------------------- private method --------------
async function getNextAnchor(id) {
  const anchorId = parseInt(id) + 1
  const detail = await Model.Anchor.findByPk(anchorId)
  if (detail) {
    return detail.dataValues
  } else {
    getNextAnchor(1)
  }
}


// 配置日志输出
function anchor_logger() {
  log4js.configure({
    appenders: {
      out: { type: 'console' },
      app: {
        type: 'dateFile',
        filename: './logs/anchor/anchor',
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    },
    categories: {
      default: { appenders: ['out', 'app'], level: 'debug' }
    }
  })
  var logger = log4js.getLogger('anchor')
  return logger
}

module.exports = {
  list,
  info,
  follow,
  next,
  begin,
  followList,
  chatList,
}