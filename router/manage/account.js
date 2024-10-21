const { errorResp, successResp } = require('../../middleware/request')
const Model = require('../../model/index')
const dataBase = require('../../model/database')
const { manager_logger } = require('./index')

async function example(req, resp) {
  manager_logger().info('The migration was successful:')
  try {

  } catch (error) {
    manager_logger().info('The migration failed:', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


/**
 * 
 * View member list
 */
async function getUserList(req, resp) {
  manager_logger().info('View member list')
  try {
    const data = req.query
    let where = {}
    if (data.username) {
      where.username = {
        [dataBase.Op.like]: `%${data.username}%`
      }
    }
    if (data.user_id) {
      where.user_id = {
        [dataBase.Op.like]: `%${data.user_id}%`
      }
    }

    if (data.startParam) {
      where.startParam = {
        [dataBase.Op.like]: `%${data.startParam}%`
      }
    }

    if (data.wallet) {
      where.wallet = {
        [dataBase.Op.like]: `%${data.wallet}%`
      }
    }

    const countAll = await Model.User.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    const list = JSON.parse(JSON.stringify(countAll))
    for (let i = 0; i < list.rows.length; i++) {
      const subUser = await Model.User.count({
        where: {
          startParam: list.rows[i].user_id
        }
      })
      list.rows[i].subUser = subUser
    }

    const total_use = await Model.User.sum('use_ton');
    return successResp(resp, { total_use, ...list}, 'success')
  } catch (error) {
    manager_logger().info('Failed to view member list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * 
 * View subordinate sub list
 */
async function getUserInviteList(req, resp) {
  manager_logger().info('View sub list')
  try {
    const data = req.query
    let where = {}
    if (data.user_id) {
      where.startParam = {
        [dataBase.Op.like]: `%${data.user_id}%`
      }
    }
  
    const countAll = await Model.User.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    const list = JSON.parse(JSON.stringify(countAll))
    for (let i = 0; i < list.rows.length; i++) {
      const subUser = await Model.User.count({
        where: {
          startParam: list.rows[i].user_id
        }
      })
      list.rows[i].subUser = subUser
    }

    const total_use = await Model.User.sum('use_ton', {
      where: {
        startParam: data.user_id
      }
    });
    return successResp(resp, { total_use: total_use || 0, ...list}, 'success')
  } catch (error) {
    manager_logger().info('Failed to view member list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

/**
 * 
 * Update member information
 */
async function updateUserInfo(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    const oldUser = await Model.User.findByPk(data.id)
    await Model.User.update(
      { ...data },
      {
        where: {
          id: data.id
        }
      }
    )
    if (data.score !== oldUser.score) {
      await Model.Event.create({
        type: 'system_change',
        from_user: req.id,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        score: data.score - oldUser.score,
        desc: `System operation coins:${data.score - oldUser.score}`
      })
    }
    if (data.use_ton !== oldUser.use_ton) {
      await Model.Event.create({
        type: 'system_change',
        from_user: 0,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        price: data.use_ton - oldUser.use_ton,
        desc: `System operation ton:${data.use_ton - oldUser.use_ton}`
      })
    }
    if (data.startParam !== oldUser.startParam) {
      await Model.Event.create({
        type: 'system_change',
        from_user: 0,
        to_user: data.user_id,
        from_username: 'system',
        to_username: data.username,
        score: 0,
        desc: `System operation:modify ${data.username} superior ID is ${data.startParam}`
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Delete member
 */
async function removeUser(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    await Model.User.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

module.exports = {
  getUserList,
  getUserInviteList,
  updateUserInfo,
  removeUser,
}