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


async function getList(req, resp) {
  manager_logger().info('View anchor list')
  try {
    const data = req.query
    const userInfo = await Model.User.findOne({
      where: {
        user_id: data.user_id
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
          list = await Model.Anchor.findAndCountAll({
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
  } catch (error) {
    manager_logger().info('Failed to view member list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function updateInfo(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    if (data.id) {
      await Model.Anchor.update(data, {
        where: {
          id: data.id
        }
      })
    } else {
      await Model.Anchor.create({
        ...data,
        label: data.code,
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

async function removeRecord(req, resp) {
  manager_logger().info('Update member information')
  try {
    const data = req.body
    await Model.Anchor.destroy(
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
  getList,
  updateInfo,
  removeRecord,
}