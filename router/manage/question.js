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
  logger('question').info('View detail list')
  try {
    const data = req.query
    let where = {
      question_list_id: parseInt(data.id)
    }
    const countAll = await Model.Question.findAndCountAll({
      order: [['sort', 'asc']],
      where,
      offset: (data.pageNum - 1) * data.pageSize,
      limit: parseInt(data.pageSize),
    })
    const list = []
    countAll.rows.forEach(async (item, index) => {
      const option_list = await Model.Option.findAll({
        where: {
          question_list_id: data.id,
          question_id: item.id
        }
      })
      list.push({...item.dataValues, option_list: option_list})
    })
    countAll.rows = list
    setTimeout(() => {
      return successResp(resp, countAll, 'success')
    }, 1000);
  } catch (error) {
    logger('error').info('question get list', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function update(req, resp) {
  logger().info('Update member information')
  try {
    await dataBase.sequelize.transaction(async (t) => {
      const data = req.body
      const list = JSON.parse(data.options)
      let question_id = data.id
      if (data.id) {
        await Model.Question.update(data, {
          where: {
            id: data.id
          }
        })
      } else {
        const res = await Model.Question.create({
          ...data,
        })
        question_id = res.dataValues.id
      }
      list.forEach(async element => {
        if (element.id) {
          await Model.Option.update({
            ...element,
            question_id,
          }, {
            where: {
              id: element.id
            }
          })
        } else {
          delete element.id
          await Model.Option.create({
            ...element,
            question_id,
            question_list_id: data.question_list_id,
          })
        }
      });
      return successResp(resp, {}, 'Successful!')
    })
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
    await Model.Question.destroy(
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