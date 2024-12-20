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
  manager_logger().info('View product list')
  try {
    const data = req.query
    const countAll = await Model.Product.findAndCountAll({
      order: [['price', 'asc']],
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    return successResp(resp, countAll, 'success')
  } catch (error) {
    manager_logger().info('Failed to view product list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function updateInfo(req, resp) {
  manager_logger().info('Update product information')
  try {
    const data = req.body
    if (data.id) {
      await Model.Product.update(data, {
        where: {
          id: data.id
        }
      })
    } else {
      await Model.Product.create({
        ...data,
        label: data.code,
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update product information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

async function removeRecord(req, resp) {
  manager_logger().info('Update product information')
  try {
    const data = req.body
    await Model.Product.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    manager_logger().info('Update product information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

module.exports = {
  getList,
  updateInfo,
  removeRecord,
}