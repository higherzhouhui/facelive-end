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
    let where = {}
    if (data.name) {
      where.name = {
        [dataBase.Op.like]: `%${data.name}%`
      }
    }
    if (data.id) {
      where.id = {
        [dataBase.Op.like]: `%${data.id}%`
      }
    }
    if (data.group) {
      where.group = {
        [dataBase.Op.like]: `%${data.group}%`
      }
    }
    if (data.style) {
      where.style = {
        [dataBase.Op.like]: `%${data.style}%`
      }
    }
    if (data.language) {
      where.language = {
        [dataBase.Op.like]: `%${data.language}%`
      }
    }
    if (data.country) {
      where.country = {
        [dataBase.Op.like]: `%${data.country}%`
      }
    }

    const countAll = await Model.Anchor.findAndCountAll({
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
   

    return successResp(resp, countAll, 'success')
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