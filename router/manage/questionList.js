const { errorResp, successResp } = require('../../middleware/request')
const Model = require('../../model/index')
const dataBase = require('../../model/database')
const { logger } = require('../../utils/common')

async function example(req, resp) {
  logger('question').info('The migration was successful:')
  try {

  } catch (error) {
    logger('question').info('The migration failed:', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}


async function getList(req, resp) {
  logger('question').info('View list')
  try {
    const data = req.query
    let where = {
    }
    const countAll = await Model.QuestionList.findAndCountAll({
      order: [['createdAt', 'desc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })


    return successResp(resp, countAll, 'success')
  } catch (error) {
    logger('error').info('question get list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function update(req, resp) {
  logger().info('Update member information')
  try {
    const data = req.body
    if (data.id) {
      await Model.QuestionList.update(data, {
        where: {
          id: data.id,
        }
      })
    } else {
      await Model.QuestionList.create({
        ...data,
      })
    }
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    logger('error').info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

async function remove(req, resp) {
  logger('error').info('Update member information')
  try {
    const data = req.body
    await Model.QuestionList.destroy(
      {
        where: {
          id: data.id
        }
      }
    )
    return successResp(resp, {}, 'Successful!')
  } catch (error) {
    logger('error').info('Update member information', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

module.exports = {
  getList,
  update,
  remove,
}