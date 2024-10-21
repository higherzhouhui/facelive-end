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
    let where = {
      type: 'recharge'
    }
    if (data.from_user) {
      where.from_user = {
        [dataBase.Op.like]: `%${data.from_user}%`
      }
    }
    if (data.from_username) {
      where.from_username = {
        [dataBase.Op.like]: `%${data.from_username}%`
      }
    }
    if (data.from_address) {
      where.from_address = {
        [dataBase.Op.like]: `%${data.from_address}%`
      }
    }
    if (data.to_user) {
      where.to_user = {
        [dataBase.Op.like]: `%${data.to_user}%`
      }
    }
    if (data.to_username) {
      where.to_username = {
        [dataBase.Op.like]: `%${data.to_username}%`
      }
    }
    if (data.to_address) {
      where.to_address = {
        [dataBase.Op.like]: `%${data.to_address}%`
      }
    }
    const countAll = await Model.Event.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    const ton = await Model.Event.sum('price', {
      where: {
        type: 'recharge'
      }
    })
    return successResp(resp, { ...countAll, ton: ton ||  0}, 'success')
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
      await Model.Event.update(data, {
        where: {
          id: data.id
        }
      })
    } else {
      await Model.Event.create({
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
    await Model.Event.destroy(
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