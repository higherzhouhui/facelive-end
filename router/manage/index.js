const log4js = require('log4js')
const { errorResp, successResp } = require('../../middleware/request')
const Model = require('../../model/index')
const utils = require('../../utils/common')

const moment = require('moment')

async function example(req, resp) {
  utils.logger('manageIndex').info('The migration was successful:')
  try {

  } catch (error) {
    utils.logger('manageIndex').info('The migration failed:', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}

/**
 * 
 * Log in
 */
async function login(req, resp) {
  utils.logger('manageIndex').info('管理后台登录', `${JSON.stringify(req.body)}`)
  try {
    const data = req.body
    const userInfo = await Model.Manager.findOne({
      where: {
        account: data.account
      }
    })
    if (!userInfo) {
      return errorResp(resp, 400, `该账号不存在！`)
    }
    if (userInfo.dataValues.password == data.password) {
      const token = utils.createToken({ username: userInfo.dataValues.account, id: userInfo.dataValues.id })
      return successResp(resp, { ...userInfo.dataValues, token }, '登录成功！')
    } else {
      return errorResp(resp, 400, `密码错误！`)
    }
  } catch (error) {
    utils.logger('manageIndex').info('Login failed', error)
    console.error(`${error}`)
    return errorResp(resp, `${error}`)
  }
}
/**
 * 
 * Get personal information
 */
async function userInfo(req, resp) {
  utils.logger('manageIndex').info('Query personal information')
  try {
    const userInfo = await Model.Manager.findByPk(req.id)
    if (!userInfo) {
      return errorResp(resp, 403, `登录时间过期，请重新登录！`)
    }
    return successResp(resp, userInfo.dataValues, '登录成功！')
  } catch (error) {
    utils.logger('manageIndex').info('Failed to retrieve personal information', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function userList(req, resp) {
  utils.logger('manageIndex').info('Query personal information')
  try {
    const list = await Model.Manager.findAndCountAll()
    return successResp(resp, list, '成功')
  } catch (error) {
    utils.logger('error').info('Failed to retrieve personal information', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}


async function updateInfo(req, resp) {
  try {
    const userInfo = await Model.Manager.findByPk(req.id)
    if (!userInfo) {
      return errorResp(resp, 403, `登录时间过期，请重新登录！`)
    }
    const data = req.body
    const is_cz = await Model.Manager.findOne({
      where: {
        account: data.account
      }
    })
    if (is_cz) {
      return errorResp(resp, 400, '该账号已经存在！')
    }
    if (data.id) {
      await Model.Manager.update(data, {
        where: {
          id: req.id
        }
      })
    } else {
      await Model.Manager.create(data)
    }

    return successResp(resp, {}, '操作成功')
  } catch (error) {
    utils.logger('error').info('Failed to retrieve personal information', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

async function remove(req, resp) {
  try {
    const userInfo = await Model.Manager.findByPk(req.id)
    if (!userInfo) {
      return errorResp(resp, 403, `登录时间过期，请重新登录！`)
    }
    await Model.Manager.destroy({
      where: {
        id: req.body.id
      }
    })
    return successResp(resp, {}, '操作成功')
  } catch (error) {
    utils.logger('error').info('Failed to retrieve personal information', error)
    console.error(`${error}`)
    return errorResp(resp, 400, `${error}`)
  }
}

module.exports = {
  login,
  userInfo,
  updateInfo,
  remove,
  userList,
}