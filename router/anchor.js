var log4js = require('log4js')
const { errorResp, successResp } = require('../middleware/request')
const Model = require('../model/index')
const dataBase = require('../model/database')
const { logger, getMessage } = require('../utils/common')

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
      const { isCommend, country, language, style, group, page } = req.query
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
        const userVideo = await Model.UserVideo.findOne({
          where: {
            user_id: req.id,
            anchor_id: id
          }
        })
        if (userVideo) {
          detail.dataValues.currentTime = userVideo.dataValues.currentTime
        } else {
          detail.dataValues.currentTime = 0
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
        return errorResp(resp, 400, `can't find this anchor`)
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
      return successResp(resp, { status: !status, heart }, 'success')
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
          if (list.includes(`${detail.id}`)) {
            detail.isLike = true
          } else {
            detail.isLike = false
          }
        }
        const userVideo = await Model.UserVideo.findOne({
          where: {
            user_id: req.id,
            anchor_id: id
          }
        })
        if (userVideo) {
          detail.currentTime = userVideo.dataValues.currentTime
        } else {
          detail.currentTime = 0
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
 * get /api/anchor/three
 * @summary 查询上一个当前下一个主播信息
 * @tags anchor
 * @description 查询上一个当前下一个主播信息
 * @security - Authorization
 */
async function three(req, resp) {
  anchor_logger().info('查询上一个当前下一个主播信息', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id } = req.query
      const lastAnchor = await getLastAnchor(id)
      const nextAnchor = await getNextAnchor(id)
      const currentAnchor = await Model.Anchor.findByPk(id)
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      const details = [lastAnchor, currentAnchor, nextAnchor]
      if (userInfo) {
        for (let i = 0; i < details.length; i++) {
          const detail = details[i]
          const follow_anchor = userInfo.follow_anchor
          if (follow_anchor) {
            const list = follow_anchor.split(',')
            if (list.includes(`${id}`)) {
              detail.dataValues.isLike = true
            }
          }
          const userVideo = await Model.UserVideo.findOne({
            where: {
              user_id: req.id,
              anchor_id: id
            }
          })
          if (userVideo) {
            detail.dataValues.currentTime = userVideo.dataValues.currentTime
          } else {
            detail.dataValues.currentTime = 0
          }
          detail[i] = detail
        }
      }
      return successResp(resp, { list: [lastAnchor.id, id, nextAnchor.id], details }, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查询上一个当前下一个主播信息失败：${error}`)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * get /api/anchor/more
 * @summary 查询后两个主播信息
 * @tags anchor
 * @description 查询后两个主播信息
 * @security - Authorization
 */
async function more(req, resp) {
  anchor_logger().info('查询后两个主播信息', req.id)
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const { id } = req.query
      const nextAnchor1 = await getNextAnchor(id)
      const nextAnchor2 = await getNextAnchor(nextAnchor1.id)
      const currentAnchor = await Model.Anchor.findByPk(id)
      const userInfo = await Model.User.findOne({
        where: {
          user_id: req.id
        }
      })
      const details = [nextAnchor1, nextAnchor2]
      if (userInfo) {
        for (let i = 0; i < details.length; i++) {
          const detail = details[i]
          const follow_anchor = userInfo.follow_anchor
          if (follow_anchor) {
            const list = follow_anchor.split(',')
            if (list.includes(`${id}`)) {
              detail.dataValues.isLike = true
            }
          }
          const userVideo = await Model.UserVideo.findOne({
            where: {
              user_id: req.id,
              anchor_id: id
            }
          })
          if (userVideo) {
            detail.dataValues.currentTime = userVideo.dataValues.currentTime
          } else {
            detail.dataValues.currentTime = 0
          }
          detail[i] = detail
        }
      }
      return successResp(resp, { details }, 'success')
    })
  } catch (error) {
    logger('anchor', 'error').error(`${req.id} 查询后两个主播信息失败：${error}`)
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
        return errorResp(resp, 403, `can't find this user`)
      }
      const anchorInfo = await Model.Anchor.findByPk(id)
      if (!anchorInfo) {
        return errorResp(resp, 400, `can't find this anchor`)
      }
      if (userInfo.score < anchorInfo.coin) {
        return errorResp(resp, 388, getMessage(userInfo.lang, 'noScore'))
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
      const UserVideo = await Model.UserVideo.findOne({
        where: {
          user_id: req.id,
          anchor_id: anchorInfo.id,
        }
      })
      // 记录用户观看视频的位置
      const UserVideoData = {
        user_id: req.id,
        anchor_id: anchorInfo.id,
        times: 1,
        currentTime: 60
      }
      if (UserVideo) {
        UserVideo.increment({
          times: 1,
          currentTime: 60
        })
      } else {
        await Model.UserVideo.create(UserVideoData)
      }

      const event_data = {
        type: 'chat_video',
        score: -anchorInfo.coin,
        from_user: req.id,
        from_username: userInfo.username,
        to_user: id,
        to_username: anchorInfo.name,
        desc: `${userInfo.username}和主播：${anchorInfo.name} 开始视频聊天，消耗${anchorInfo.coin}金币`
      }
      await Model.Event.create(event_data)
      return successResp(resp, { time: anchorInfo.time + 60, ...userInfo.dataValues }, 'success')
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
        let user_follow_anchor = ''
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
            list.forEach(lItem => {
              user_follow_anchor += `${lItem.id},`
            })
          }
        }
        await userInfo.update({
          follow_anchor: user_follow_anchor
        })
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
        let user_chat_anchor = ''
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
            list.forEach(lItem => {
              user_chat_anchor += `${lItem.id},`
            })
          }
        }
        await userInfo.update({
          chat_anchor: user_chat_anchor
        })
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
  const originAnchor = await Model.Anchor.findByPk(id)
  const sort = originAnchor.sort || 0
  const detail = await Model.Anchor.findOne({
    where: {
      sort: {
        [dataBase.Op.gt]: sort
      }
    }
  })
  if (detail) {
    return detail
  } else {
    return getNextAnchor(0)
  }
}

async function getLastAnchor(id) {
  const originAnchor = await Model.Anchor.findByPk(id)
  const maxSort = await Model.Anchor.findOne({
    order: [['sort', 'desc']]
  })
  const sort = originAnchor.sort || maxSort.sort
  const detail = await Model.Anchor.findOne({
    order: [['updatedAt', 'desc']],
    where: {
      sort: {
        [dataBase.Op.lt]: sort
      }
    }
  })
  if (detail) {
    return detail
  } else {
    return getNextAnchor(maxSort.sort)
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
  three,
  more,
}